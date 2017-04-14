(function() {
    'use strict';
    angular.module('app.components').controller('FilterControlController', FilterControlController).component('filterControl', {
        // templateUrl: 'app/components/filterControl/filter-control.html',
        bindings: {
            item: '<',
        },
        controller: 'FilterControlController',
        controllerAs: 'vm'
    });
    FilterControlController.$inject = ['$element', '$compile', '$scope', 'DecisionNotificationService', 'Utils'];

    function FilterControlController($element, $compile, $scope, DecisionNotificationService, Utils) {
        var vm = this;
        vm.$onChanges = onChanges;
        vm.$onInit = onInit;

        function onInit() {
            // console.log(vm.item.valueType, vm.item.visualMode);
            // vm.item = _.pick(vm.item, 'valueType', 'visualMode', 'filterable', 'options', 'characteristicId');
            // var html = '<span class="link-secondary" uib-popover="' + vm.item + '" popover-placement="right" popover-append-to-body="true" popover-trigger="\'outsideClick\'" tabindex="0"><i class="glyphicon glyphicon-filter"></i></span>';
            chooseValueType(vm.item);
            // TODO: make nested switch
            function chooseValueType(item) {
                if (!item || !item.valueType) return;
                // CASE
                switch (item.valueType.toUpperCase()) {
                    case "STRING":
                        if (item.visualMode === 'SELECT') {
                            renderSelect(item);
                        }
                        break;
                    case "DATETIME":
                        createDatePicker(item);
                        break;
                    case "INTEGER":
                        // RANGE PICKER
                        if (item.visualMode === 'INTEGERRANGESLIDER') {
                            var rangePicker = createRangePicker(item);
                            renderHtml(rangePicker);
                        }
                        break;
                    case "STRINGARRAY":
                        if (item.visualMode === 'LABEL') {
                            renderCheckboxes(item);
                        }
                        break;
                    case "INTEGERARRAY":
                        if (item.visualMode === 'LABEL') {
                            renderCheckboxes(item);
                        } else if (item.visualMode === 'SELECT') {
                            renderSelect(item);
                        }
                        break;
                    default:
                        item.value = item.value || '';
                }
            }

            function chooseVisualMode() {}
            // TODO: move to separete template
            function createRangePicker(item) {
                // console.log(item);
                var html = '';
                html = '<div class="filter-item-wrapper">';
                html += '<input type="range" ng-model="range"  min="' + item.minValue + '" max="' + item.maxValue + '">';
                html += '<small>{{range}}</small>';
                html += '</div>';
                return html;
            }

            function renderSelect(item) {
                var html = '<div class="filter-item-wrapper">';
                var options = _.sortBy(item.options, 'name');
                html += '<select class="form-control input-sm">';
                _.map(options, function(option) {
                    html += '<option value="' + option.characteristicOptionId +'">' + option.name + '</option>';
                });
                html += '</select>';
                html += '</div>';
                renderHtml(html);
            }

            function createDatePicker(item) {
                // console.log(item);
                var html = '';
                // html += '<input type="text" class="form-control input-sm" uib-datepicker-popup="{{format}}" ng-model="dt" close-text="Close" />';
                html += '<i class="fa fa-calendar" aria-hidden="true"></i>';
                renderHtml(html);
            }

            function renderHtml(html) {
                $element.html(html);
                $compile($element.contents())($scope);
            }

            function renderCheckboxes(item) {
                // String Array type
                var html = '<div class="filter-item">';
                var options = _.sortBy(item.options, 'name');
                _.map(options, function(option) {
                    html += '<div class="filter-item-checkbox"><input type="checkbox" id="option-' + option.characteristicOptionId + '" name="option-' + option.characteristicOptionId + '" value="' + option.value + '"> ';
                    html += '<label for="option-' + option.characteristicOptionId + '">' + option.name + '</label>';
                    html += '</div>';
                });
                html += '</div>';
                renderHtml(html);
                var checkedValues = [];
                $element.find('.filter-item-checkbox input').on('change', function() {
                    var checkbox,
                        value;
                    checkbox = $(this);
                    value = checkbox.val();
                    if (checkbox.is(':checked')) {
                        Utils.addItemToArray(value, checkedValues);
                    } else {
                        Utils.removeItemFromArray(value, checkedValues);
                    }
                    // console.log(checkedValues);
                    var sendObj = {
                        'type': 'AllInQuery',
                        'characteristicId': item.characteristicId,
                        'value': checkedValues
                    };
                    createFilterQuery(sendObj);
                });
            }
        }

        function onChanges() {
            onInit();
        }
        // TODO: move to Data Filter servise
        function createFilterQuery(data) {
            var filterQueries = {
                'type': data.type || 'AllInQuery',
                'characteristicId': data.characteristicId || null,
                'value': data.value || null
            };
            var sendData = {
                'filterQueries': filterQueries
            };
            DecisionNotificationService.notifySelectCharacteristic(sendData);
        }
    }
})();