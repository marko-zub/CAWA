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
        // vm.$onChanges = onChanges;
        vm.$onInit = onInit;


        var selectAllObj = {
            characteristicId: null,
            characteristicOptionId: '*',
            createDate: null,
            description: null,
            name: 'All',
            value: null
        };


        function onInit() {
            // console.log(vm.item.valueType, vm.item.visualMode);
            // vm.item = _.pick(vm.item, 'valueType', 'visualMode', 'filterable', 'options', 'characteristicId');
            // var html = '<span class="link-secondary" uib-popover="' + vm.item + '" popover-placement="right" popover-append-to-body="true" popover-trigger="\'outsideClick\'" tabindex="0"><i class="glyphicon glyphicon-filter"></i></span>';
            chooseValueType(vm.item);

            // TODO: make nested switch ?!
            function chooseValueType(item) {
                if (!item || !item.valueType || !item.visualMode) return;
                item.valueType = item.valueType.toUpperCase();
                item.visualMode = item.visualMode.toUpperCase();


                switch (true) {
                    case ((item.valueType === 'STRING') && (item.visualMode === 'SELECT')):
                        renderSelect(item);
                        break;
                    case ((item.valueType === 'DATETIME') && (item.visualMode === 'DATERANGEPICKER')):
                        createDateRangePicker(item);
                        break;
                    case ((item.valueType === 'INTEGER') && (item.visualMode === 'INTEGERRANGESLIDER')):
                        renderRangeSlider(item);
                        break;
                    case ((item.valueType === 'STRINGARRAY') && (item.visualMode === 'LABEL')):
                        renderCheckboxes(item);
                        break;
                    case ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'LABEL')):
                        renderCheckboxes(item);
                        break;
                    case ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'SELECT')):
                        renderSelect(item);
                        break;
                    case ((item.valueType === 'BOOLEAN') && (item.visualMode === 'RADIOGROUP')):
                        renderRadiogroup(item);
                        break;
                    default:
                        //Empty
                }
            }

            function chooseVisualMode() {}


            // TODO: move to separete template
            function renderRangeSlider(item) {
                vm.slider = {
                    min: Number(item.minValue),
                    max: Number(item.maxValue),
                    options: {
                        floor: Number(item.minValue),
                        ceil: Number(item.maxValue)
                    }
                };

                var html = '';
                html = '<div class="filter-item-wrapper">';
                html += '<rzslider rz-slider-model="vm.slider.min" rz-slider-high="vm.slider.max" rz-slider-model="vm.slider.value" rz-slider-options="vm.slider.options"></rzslider>';
                html += '<small>{{vm.slider.min}} - {{vm.slider.max}}</small>';
                html += '</div>';
                renderHtml(html);
            }

            function renderRadiogroup(item) {
                vm.radio = 'Yes';

                var html = '';
                html = '<div class="filter-item-wrapper"><small>';
                html += '<input name="radio" type="radio" ng-model="vm.radio" value="Yes"> Yes<br/>';
                html += '<input name="radio" type="radio" ng-model="vm.radio" value="No"> No<br/>';
                html += '{{vm.radio}}';
                html += '</small></div>';
                renderHtml(html);
            }

            function renderSelect(item) {
                var html = '<div class="filter-item-wrapper">';
                var options = _.sortBy(item.options, 'name');
                options.unshift(selectAllObj);
                html += '<select class="form-control input-sm">';
                _.map(options, function(option) {
                    html += '<option value="' + option.characteristicOptionId + '">' + option.name + '</option>';
                });
                html += '</select>';
                html += '</div>';
                renderHtml(html);
            }

            function createDateRangePicker(item) {
                // console.log(item);
                var html = '';
                vm.date = new Date();
                html += '<input date-range-picker class="form-control input-sm date-picker" type="text" ng-model="vm.date" min="\'2014-02-23\'" max="\'2015-02-25\'" />';
                renderHtml(html);
            }

            function renderHtml(html) {
                $element.html(html);
                $compile($element.contents())($scope);
            }

            function renderCheckboxes(item) {
                // String Array type
                var html = '<div class="filter-item checkbox-list">';
                var options = _.sortBy(item.options, 'name');
                _.map(options, function(option) {
                    html += '<div class="filter-item-checkbox">';
                    html += '<input type="checkbox" id="option-' + option.characteristicOptionId + '" name="option-' + option.characteristicOptionId + '" value="' + option.value + '"> ';
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

        // TODO: move to Data Filter servise
        function createFilterQuery(data, queryType) {
            // Make constructor for Filter Query
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