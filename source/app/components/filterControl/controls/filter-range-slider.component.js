(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterRangeSliderController', FilterRangeSliderController)
        .component('filterRangeSlider', {
            bindings: {
                item: '<',
            },
            controller: 'FilterRangeSliderController',
            controllerAs: 'vm'
        });

    FilterRangeSliderController.$inject = ['FilterControlsDataService', '$element', '$compile', '$scope'];

    function FilterRangeSliderController(FilterControlsDataService, $element, $compile, $scope) {
        var
            vm = this;

        vm.callRangeSlider = callRangeSlider;

        vm.$onInit = onInit;

        function onInit() {
            // debugger
            var html = renderRangeSlider(vm.item);
            $element.html(html);
            $compile($element.contents())($scope);
        }

        // TODO: move to separete template
        function renderRangeSlider(item) {
            vm.slider = {
                min: Number(item.minValue),
                max: Number(item.maxValue),
                options: {
                    floor: Number(item.minValue),
                    ceil: Number(item.maxValue),
                    id: 'slider-' + item.characteristicId,
                    onEnd: vm.callRangeSlider,
                    hidePointerLabels: true,
                    hideLimitLabels: true
                }
            };

            var html = [
                '<div class="filter-item-wrapper">',
                '<rzslider rz-slider-model="vm.slider.min" rz-slider-high="vm.slider.max" rz-slider-model="vm.slider.value" rz-slider-options="vm.slider.options"></rzslider>',
                '<small>{{vm.slider.min}} - {{vm.slider.max}}</small>',
                '</div>'
            ].join('\n');
            return html;
        }


        function callRangeSlider(sliderId, min, max, type) {
            // console.log('call range ', sliderId, vm.slider.value, vm.item.characteristicId, vm.slider);
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