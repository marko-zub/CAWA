(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterDateRangeController', FilterDateRangeController)
        .component('filterDateRange', {
            bindings: {
                item: '<',
            },
            controller: 'FilterDateRangeController',
            controllerAs: 'vm'
        });

    FilterDateRangeController.$inject = ['FilterControlsDataService', '$element', '$compile', '$scope'];

    function FilterDateRangeController(FilterControlsDataService, $element, $compile, $scope) {
        var
            vm = this;

        vm.$onInit = onInit;

        function onInit() {
            var html = createDateRangePicker(vm.item);
            $element.html(html);
            $compile($element.contents())($scope);
        }

        // Control DATERANGEPICKER
        function createDateRangePicker(item) {
            vm.dateRange = {
                startDate: null,
                endDate: null
            };
            vm.dateRangeOptions = {
                locale: {
                    format: 'DD/MM/YYYY'
                },
                showDropdowns: true, // some bug
                linkedCalendars: false,
                eventHandlers: {
                    'apply.daterangepicker': function() {
                        changeDate(vm.dateRange, item);
                    }
                }
            };

            var html = '<input date-range-picker options="vm.dateRangeOptions" class="form-control input-sm date-picker" type="text" ng-model="vm.dateRange" />';
            return html;
        }


        function changeDate(model, item) {
            if (!item.id) return;
            if (model === 'null') model = null;

            var queries;
            if (!model.startDate && !model.endDate) {
                queries = null;
            } else {
                var startDate = parseInt(model.startDate.valueOf());
                var endDate = parseInt(model.endDate.valueOf());
                queries = [{
                    "type": "GreaterOrEqualQuery",
                    "id": item.id,
                    "value": startDate
                }, {
                    "type": "LessOrEqualQuery",
                    "id": item.id,
                    "value": endDate
                }];
            }

            var query = {
                "type": "CompositeQuery",
                "characteristicId": item.id,
                "characteristicName": item.name,
                "operator": "AND",
                "queries": queries
            };

            FilterControlsDataService.characteristicChange(item.id, query);
        }
        // END Control DATERANGEPICKER

    }
})();