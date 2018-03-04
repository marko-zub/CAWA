(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterCheckboxGroupController', FilterCheckboxGroupController)
        .component('filterCheckboxGroup', {
            bindings: {
                item: '<',
                selected: '<',
            },
            controller: 'FilterCheckboxGroupController',
            controllerAs: 'vm'
        });

    FilterCheckboxGroupController.$inject = ['FilterControlsDataService', '$element', '$compile',
        '$scope', 'Utils', 'DecisionDataService', '$state', 'DecisionNotificationService'
    ];

    function FilterCheckboxGroupController(FilterControlsDataService, $element, $compile,
        $scope, Utils, DecisionDataService, $state, DecisionNotificationService) {
        var
            vm = this,
            sendObj = {
                'operator': 'OR'
            },
            checkedValues = [],
            optionIds = [],
            sendRequestDebounce = _.debounce(sendRequest, 100);

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            sendObj = {
                'characteristicId': vm.item.id,
                'operator': 'OR'
            };

            // Lazy options
            if (vm.item.lazyOptions === true) {
                vm.filterSpinner = true;
                getLazyOptions(vm.item.id);
                return;
            } else {
                renderItem(vm.item);
            }
        }

        function onChanges(changes) {
            if (changes.selected && !angular.equals(changes.selected.currentValue, changes.selected.previousValue)) {
                selectCheckboxes(angular.copy(changes.selected.currentValue));
            }

            // TODO: check and/or, simplify logic
            if (changes.item &&
                !angular.equals(changes.item.currentValue, changes.item.previousValue)) {

                if (changes.item.previousValue.selectedOperator === changes.item.currentValue.selectedOperator) {
                    return;
                }

                handleChangesSwitcher(changes.item.currentValue.selectedOperator);

                if (changes.item.currentValue && changes.item.currentValue.optionIds) {
                    handleSelectedOptionIds(changes.item.currentValue.optionIds);
                }
            }

        }

        function handleChangesSwitcher(selectedOperator) {
            var switcherEl = $($element).find('.js-switcher-checkbox');
            if (selectedOperator === 'AND') {
                switcherEl.prop('checked', false);
                sendObj.operator = selectedOperator;
            } else {
                switcherEl.prop('checked', true);
                sendObj.operator = 'OR';
            }
        }

        function handleSelectedOptionIds(changesOptionIds) {
            if (_.isArray(optionIds)) {
                optionIds = changesOptionIds;
            }
        }

        function renderItem(item) {
            var html = renderCheckboxes(item);
            $element.html(html);
            $compile($element.contents())($scope);
        }

        function getLazyOptions(optionId) {
            return DecisionDataService.getCharacteristicOptionsById(optionId)
                .then(function(resp) {
                    vm.item.options = resp;
                    vm.filterSpinner = false;
                    renderItem(vm.item);
                    DecisionNotificationService.notifyUpdateMatrixSize();
                    return resp;
                });
        }

        // TODO:
        // jQuery because slow ng-repeat
        function selectCheckboxes(list) {
            if (!_.isNull(vm.item.selectedValue) && vm.item.optionIds && vm.item.optionIds.length) {
                // checkedValues = list;
                optionIds = vm.item.optionIds;
                $($element).find('.filter-item-checkbox input.js-checkbox').each(function() {
                    var val = parseInt($(this).data('option-id'), 10);
                    if (_.includes(vm.item.optionIds, val)) {
                        $(this).prop('checked', true);
                    } else {
                        $(this).prop('checked', false);
                    }
                });
            } else if (_.isEmpty(list)) {
                checkedValues = [];
                optionIds = [];
                $($element).find('.filter-item-checkbox input.js-checkbox:checked').prop('checked', false);
            } else {
                checkedValues = list;
                optionIds = list;
                $($element).find('.filter-item-checkbox input.js-checkbox').each(function() {
                    var val = $(this).val();
                    if (_.includes(list, val)) {
                        $(this).prop('checked', true);
                    } else {
                        $(this).prop('checked', false);
                    }
                });
            }
        }

        function renderCheckboxes(item) {
            // String Array type
            var options = _.sortBy(item.options, 'value');
            var isValuesLinkedToOption = false;
            if (item.valuesLinkedToOption) {
                isValuesLinkedToOption = true;
            }

            var content = _.map(options, function(option) {

                var dataOptionId = '';
                var checked = '';
                if (_.includes(item.selectedValue, option.value) ||
                    !item.selectedValue && item.optionIds && _.includes(item.optionIds, option.id)
                ) {
                    checked = ' checked';
                }
                if (isValuesLinkedToOption === true) {
                    dataOptionId = ' data-option-id="' + option.id + '"';
                }
                var html = [
                    '<div class="filter-item-checkbox">',
                    '   <input class="js-checkbox" type="checkbox" id="' + item.id + '-option-' + option.id + '" name="option-' + option.id + '" value="' + option.value + '"' + checked + dataOptionId + '>',
                    '   <label for="' + item.id + '-option-' + option.id + '">' + option.value + '</label>',
                    '</div>'
                ];
                return html.join('\n');
            }).join('\n');

            var queryTypeHtml = [
                '<div class="switcher">',
                '   <div class="switcher-label">',
                '       <div class="switcher-text-label">{{ "OR" | translate }}</div>',
                '   </div>',
                '</div>',
            ].join('\n');

            // Allow multiply values switcher OR/AND
            // if (item.valueType === 'STRING') {
            var switcherControl = '';

            if (item.lazyOptions || _.isArray(item.options) && item.options.length) {
                switcherControl = [
                    '<span class="switcher-inner">',
                    '   <span class="operator-before">{{ "OR" | translate }}</span>',
                    '   <span class="operator-after">{{ "AND" | translate }}</span>',
                    '</span>'
                ].join('\n');
            }

            if (item.multiValue === true) {
                queryTypeHtml = [
                    '<div class="switcher">',
                    '   <input type="checkbox" name="switcher" class="switcher-checkbox js-switcher-checkbox" id="toggle-' + item.id + '" checked>',
                    '   <label class="switcher-label" for="toggle-' + item.id + '">',
                    switcherControl,
                    '       <span class="switcher-switch"></span>',
                    '   </label>',
                    '</div>',
                ].join('\n');
            }

            var html = [
                '<div class="query-type-wrapper">',
                queryTypeHtml,
                '</div>',
                '<div class="filter-item checkbox-list" dw-scroll-bar>',
                '   <div>',
                content,
                '   </div>',
                '</div>',
                '<div ng-show="vm.filterSpinner" class="app-loader-small"><i class="dw-icon-refresh" aria-hidden="true"></i></div>'
            ].join('\n');

            return html;
        }

        $($element).on('change', '.filter-item-checkbox input.js-checkbox', function() {
            var checkbox,
                value;
            checkbox = $(this);

            if (checkbox.data('option-id')) {
                value = parseInt(checkbox.data('option-id'), 10);
                if (checkbox.is(':checked')) {
                    Utils.addItemToArray(value, optionIds);
                } else {
                    Utils.removeItemFromArray(value, optionIds);
                }

                // TODO: simplify Check if exist text only switcher
                if ($($element).find('.switcher-text-label').length) {
                    sendObj.operator = 'OR';
                }

                sendObj.optionIds = optionIds;
                sendRequestDebounce(angular.copy(sendObj));

            } else {
                value = checkbox.val();
                if (checkbox.is(':checked')) {
                    Utils.addItemToArray(value, checkedValues);
                } else {
                    Utils.removeItemFromArray(value, checkedValues);
                }

                // TODO: simplify Check if exist text only switcher
                if ($($element).find('.switcher-text-label').length) {
                    sendObj.operator = 'OR';
                }

                sendObj.value = checkedValues;
                sendRequestDebounce(angular.copy(sendObj));
            }
        });

        $($element).on('change', '.query-type-wrapper input.js-switcher-checkbox', function() {
            sendObj.operator = ($(this).is(':checked')) ? 'OR' : 'AND';

            if (vm.item.valuesLinkedToOption) {
                delete sendObj.value;
                sendObj.optionIds = optionIds;
                if (!_.isEmpty(sendObj.optionIds)) {
                    var sendObjCopyValue = angular.copy(sendObj);
                    sendRequestDebounce(sendObjCopyValue);
                }
            } else {
                delete sendObj.optionIds;
                sendObj.value = checkedValues;
                if (!_.isEmpty(sendObj.value)) {
                    var sendObjCopyOptionIds = angular.copy(sendObj);
                    sendRequestDebounce(sendObjCopyOptionIds);
                }
            }
        });

        function sendRequest(sendObjCopy) {
            FilterControlsDataService.createFilterQuery(sendObjCopy);
        }

    }
})();