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

    FilterDateRangeController.$inject = ['FilterControlsDataService', '$element', '$compile', '$scope', 'Config'];

    function FilterDateRangeController(FilterControlsDataService, $element, $compile, $scope, Config) {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            var html = createDateRangePicker(vm.item);
            $element.html(html);
            $compile($element.contents())($scope);
        }

        // Control DATERANGEPICKER
        function createDateRangePicker(item) {
            var options = {
                locale: {
                    format: Config.FORMAT_DATE
                },
                showDropdowns: true, // some bug
                linkedCalendars: false,
                eventHandlers: {
                    'apply.daterangepicker': function() {
                        changeDate(vm.dateRange, item);
                    }
                }
            };

            if (item.visualMode.toUpperCase() === 'DATETIMERANGEPICKER') {
                options = _.merge(options, {
                    timePicker: true,
                    timePicker24Hour: true,
                    timePickerSeconds: true,
                    locale: {
                        format: Config.FORMAT_DATETIME
                    }
                });
            }

            vm.dateRangeOptions = options;

            vm.dateRange = {
                startDate: null,
                endDate: null
            };

            var html = '<div class="filter-item-content"><input date-range-picker options="vm.dateRangeOptions" class="form-control input-sm date-picker" type="text" ng-model="vm.dateRange" /></div>';
            return html;
        }


        function changeDate(model, item) {
            if (!item.id) return;
            if (model === 'null') model = null;

            var queries;
            if (!model.startDate && !model.endDate) {
                queries = null;
            } else {
                var startDate = model.startDate.valueOf();
                var endDate = model.endDate.valueOf();
                queries = [startDate, endDate];
            }

            var query = {
                'type': 'RangeQuery',
                'characteristicId': item.id,
                'value': queries
            };

            if (item.visualMode.toUpperCase() !== 'DATETIMERANGEPICKER') {
                query.operator = 'AND';
            }

            // console.log(moment(model.startDate.valueOf()).format(Config.FORMAT_DATETIME));

            FilterControlsDataService.characteristicChange(item.id, query);
        }
        // END Control DATERANGEPICKER

    }
})();