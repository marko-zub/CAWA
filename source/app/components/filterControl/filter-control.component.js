(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterControlController', FilterControlController)
        .component('filterControl', {
            // templateUrl: 'app/components/filterControl/filter-control.html',
            bindings: {
                item: '<',
            },
            controller: 'FilterControlController',
            controllerAs: 'vm'
        });

    FilterControlController.$inject = ['$element', '$compile', '$scope', 'DecisionNotificationService', 'Utils'];

    function FilterControlController($element, $compile, $scope, DecisionNotificationService, Utils) {
        var
            vm = this;

        vm.$onChanges = onChanges;
        vm.$onInit = onInit;

        function onInit() {
           
                // console.log(vm.item.valueType, vm.item);
                vm.item = _.pick(vm.item, 'valueType', 'visualMode', 'filterable', 'options', 'characteristicId');
                // var html = '<span class="link-secondary" uib-popover="' + vm.item + '" popover-placement="right" popover-append-to-body="true" popover-trigger="\'outsideClick\'" tabindex="0"><i class="glyphicon glyphicon-filter"></i></span>';
                typeFormaterFilter(vm.item);

            function typeFormaterFilter(item) {
                if (!item || !item.valueType) return;
                // CASE
                switch (item.valueType.toUpperCase()) {
                    case "STRING":
                        // item = stringFullDescr(item);
                        break;
                    case "DATETIME":
                        var datePicker = createDatePicker(item);
                        renderHtml(datePicker);
                        break;
                    case "STRINGARRAY":
                        // item.value = typeFormaterArray(item.value);
                        break;
                    case "INTEGERARRAY":
                        // item.value = typeFormaterArray(item.value);
                        break;
                    default:
                        item.value = item.value || '';
                }
            }

            function createDatePicker(item) {
                // console.log(item);
                var html = '';
                // html += '<input type="text" class="form-control input-sm" uib-datepicker-popup="{{format}}" ng-model="dt" close-text="Close" />';
                html += '<i class="fa fa-calendar" aria-hidden="true"></i>';
                return html;
            }
    

            function renderHtml(html) {
                $element.html(html);
                $compile($element.contents())($scope);                
            }
             // 
             if (vm.item.options) {
                // String Array type
                var html = '<div class="filter-item">';
                var options = _.sortBy(vm.item.options, 'name');
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
                        'characteristicId': vm.item.characteristicId,
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