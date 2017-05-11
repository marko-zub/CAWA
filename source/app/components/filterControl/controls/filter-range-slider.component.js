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
            '<div class="filter-item-wrapper">',
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
            if (!min || !max) return;
            vm.slider.min = Number(min);
            vm.slider.max = Number(max);
        }

        // TODO: move to separete template
        function initRangeSlider(item) {
            vm.slider = {
                min: Number(item.minValue),
                max: Number(item.maxValue),
                options: {
                    floor: Number(item.minValue),
                    ceil: Number(item.maxValue),
                    id: 'slider-' + item.characteristicId,
                    onEnd: vm.changeRangeSlider,
                    hidePointerLabels: true,
                    hideLimitLabels: true
                }
            };
        }


        function changeRangeSlider(sliderId, min, max, type) {
            // TOOD: make some builder for queries
            var queries = [{
                "type": "GreaterOrEqualQuery",
                "characteristicId": vm.item.characteristicId,
                "value": min
            }, {
                "type": "LessOrEqualQuery",
                "characteristicId": vm.item.characteristicId,
                "value": max
            }];
            if (min == vm.item.minValue && max == vm.item.maxValue) {
                queries = null;
            }
            var query = {
                "type": "CompositeQuery",
                "characteristicId": vm.item.characteristicId,
                "characteristicName": vm.item.name,
                "operator": "AND",
                "queries": queries
            };

            //
            FilterControlsDataService.characteristicChange(vm.item.characteristicId, query);
        }

    }
})();