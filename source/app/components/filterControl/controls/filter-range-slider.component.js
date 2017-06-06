(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterRangeSliderController', FilterRangeSliderController)
        .component('filterRangeSlider', {
            template: renderTemplate,
            bindings: {
                item: '<',
                selected: '<'
            },
            controller: 'FilterRangeSliderController',
            controllerAs: 'vm'
        });

    renderTemplate.$inject = [];

    function renderTemplate() {
        return [
            '<div class="filter-item-wrapper" ng-if="vm.showRange">',
            '<rzslider rz-slider-model="vm.slider.min" rz-slider-high="vm.slider.max" rz-slider-model="vm.slider.value" rz-slider-options="vm.slider.options"></rzslider>',
            '<small>{{vm.slider.min}} - {{vm.slider.max}}</small>',
            '</div>'
        ].join('\n');
    }

    FilterRangeSliderController.$inject = ['FilterControlsDataService'];

    function FilterRangeSliderController(FilterControlsDataService) {
        var
            vm = this;

        vm.changeRangeSlider = changeRangeSlider;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;
        vm.showRange = false;

        function onInit() {
            initRangeSlider(vm.item);
        }

        function onChanges(changes) {
            if (!angular.equals(changes.selected.currentValue, changes.selected.previousValue)) {
                if (_.isNull(changes.selected.currentValue)) {
                    initRangeSliderValues(vm.item.minValue, vm.item.maxValue);
                } else if (_.isArray(changes.selected.currentValue)) {
                    var rangeVals = changes.selected.currentValue.splice(',');
                    initRangeSliderValues(rangeVals[0], rangeVals[1]);
                }
            }
        }

        function initRangeSliderValues(min, max) {
            vm.slider.min = Number(min);
            vm.slider.max = Number(max);
            if (_.isNaN(vm.slider.min) || _.isNaN(vm.slider.max)) return;
        }

        // TODO: move to separete template
        function initRangeSlider(item) {
            var step = 1;
            if(item.visualMode.toUpperCase() === 'DOUBLERANGESLIDER') {
                step = 0.1;
            }

            var minVal = Number(item.minValue);
            var maxVal = Number(item.maxValue);

            if(!_.isNaN(minVal) && !_.isNaN(maxVal)) {
                vm.showRange = true;
            }
            vm.slider = {
                min: minVal,
                max: maxVal,
                options: {
                    step: step,
                    floor: Number(item.minValue),
                    ceil: Number(item.maxValue),
                    precision: 1,
                    id: 'slider-' + item.id,
                    onEnd: vm.changeRangeSlider,
                    hidePointerLabels: true,
                    hideLimitLabels: true
                }
            };
        }


        function changeRangeSlider(sliderId, min, max, type) {
            var value = (_.isNumber(max) && _.isNumber(min)) ? [min, max] : null;
            var query = {
                "type": "RangeQuery",
                "characteristicId": vm.item.id,
                "value": value
            };
            FilterControlsDataService.characteristicChange(vm.item.id, query);
        }

    }
})();