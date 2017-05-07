(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterControlController', FilterControlController)
        .component('filterControl', {
            bindings: {
                item: '<',
            },
            controller: 'FilterControlController',
            controllerAs: 'vm'
        });



    FilterControlController.$inject = ['$element', '$compile', '$scope', 'DecisionNotificationService', 'Utils', 'FilterControlsDataService'];

    function FilterControlController($element, $compile, $scope, DecisionNotificationService, Utils, FilterControlsDataService) {
        var vm = this,
            controlOptions;
        // vm.$onChanges = onChanges;
        vm.$onInit = onInit;
        vm.$onDestroy = onDestroy;

        vm.controlOptions = {
            debounce: 50
        };

        function onInit() {
            chooseValueType(vm.item);
        }


        // TODO: make nested switch ?!
        function chooseValueType(item) {
            if (!item || !item.valueType || !item.visualMode) return;
            item.valueType = item.valueType.toUpperCase();
            item.visualMode = item.visualMode.toUpperCase();

            switch (true) {
                case ((item.valueType === 'STRING') && (item.visualMode === 'SELECT')):
                    renderHtml('<filter-select item="::vm.item"></filter-select>');
                    break;
                case ((item.valueType === 'DATETIME') && (item.visualMode === 'DATERANGEPICKER')):
                    createDateRangePicker(item);
                    break;
                case ((item.valueType === 'INTEGER') && (item.visualMode === 'INTEGERRANGESLIDER')):
                    renderHtml('<filter-range-slider item="::vm.item"></filter-range-slider>');
                    break;
                case ((item.valueType === 'STRINGARRAY') && (item.visualMode === 'LABEL')):
                    renderCheckboxes(item);
                    break;
                case ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'LABEL')):
                    renderCheckboxes(item);
                    break;
                case ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'SELECT')):
                    renderHtml('<filter-select item="::vm.item"></filter-select>');
                    break;
                case ((item.valueType === 'BOOLEAN') && (item.visualMode === 'RADIOGROUP')):
                    renderHtml('<filter-radio-group item="::vm.item"></filter-radio-group>');
                    break;
                default:
                    //Empty
            }
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
            renderHtml(html);
        }

        function dateToDB(date) {
            var momentDate = Date(date);
            return moment(momentDate).valueOf();
        }

        function changeDate(model, item) {
            if (!item.characteristicId) return;
            if (model === 'null') model = null;

            var queries;
            if (!model.startDate && !model.endDate) {
                queries = null;
            } else {
                var startDate = parseInt(model.startDate.valueOf());
                var endDate = parseInt(model.endDate.valueOf());
                queries = [{
                    "type": "GreaterOrEqualQuery",
                    "characteristicId": item.characteristicId,
                    "value": startDate
                }, {
                    "type": "LessOrEqualQuery",
                    "characteristicId": item.characteristicId,
                    "value": endDate
                }];
            }

            var query = {
                "type": "CompositeQuery",
                "characteristicId": item.characteristicId,
                "characteristicName": item.name,
                "operator": "AND",
                "queries": queries
            };
            // console.log(queries);
            FilterControlsDataService.characteristicChange(item.characteristicId, query);
        }
        // END Control DATERANGEPICKER

        // TODO: move to separate component clean up
        // Choose Juqey or Angular
        // Control Checkboxes
        vm.sendObj = {};

        function renderCheckboxes(item) {
            // String Array type
            var options = _.sortBy(item.options, 'name');

            var content = _.map(options, function(option) {
                var html = [
                    '<div class="filter-item-checkbox">',
                    '<input type="checkbox" id="option-' + option.characteristicOptionId + '" name="option-' + option.characteristicOptionId + '" value="' + option.value + '">',
                    '<label for="option-' + option.characteristicOptionId + '">' + option.name + '</label>',
                    '</div>'
                ];
                return html.join('\n');
            }).join('\n');

            var queryTypeHtml = [
                '<div class="switcher">',
                '<input type="checkbox" name="switcher" class="switcher-checkbox" id="toggle-' + item.characteristicId + '" checked>',
                '<label class="switcher-label" for="toggle-' + item.characteristicId + '">',
                '<span class="switcher-inner"></span>',
                '<span class="switcher-switch"></span>',
                '</label>',
                '</div>',
            ].join('\n');


            var html = [
                '<div class="query-type-wrapper">',
                queryTypeHtml,
                '</div>',
                '<div class="filter-item checkbox-list">',
                content,
                '</div>'
            ].join('\n');

            renderHtml(html);

            // TODO: jQuery vs Angular
            // Change value

            var sendObj = {
                'type': 'AllInQuery',
                "characteristicName": item.name,
                'characteristicId': item.characteristicId,
                "operator": 'OR'
            };
            var checkedValues = [];
            $($element).on('change', '.filter-item-checkbox input', function() {
                var checkbox,
                    value;
                checkbox = $(this);
                value = checkbox.val();
                if (checkbox.is(':checked')) {
                    Utils.addItemToArray(value, checkedValues);
                } else {
                    Utils.removeItemFromArray(value, checkedValues);
                }

                sendObj.value = checkedValues;
                vm.sendObj = sendObj;
                FilterControlsDataService.createFilterQuery(sendObj);
            });

            $($element).on('change', '.query-type-wrapper input', function() {
                if (_.isEmpty(vm.sendObj.value)) return;
                if ($(this).is(':checked')) {
                    vm.sendObj.operator = 'OR';
                } else {
                    vm.sendObj.operator = 'AND';
                }

                // console.log(vm.sendObj);
                FilterControlsDataService.createFilterQuery(vm.sendObj);
            });
        }
        // END Control Checkboxes

        function onDestroy() {
            //onDestroy all js event
            $element.find('.filter-item-checkbox input').off('change');
        }

        function renderHtml(html) {
            $element.html(html);
            $compile($element.contents())($scope);
        }
    }
})();