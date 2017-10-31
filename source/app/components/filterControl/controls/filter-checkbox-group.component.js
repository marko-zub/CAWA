(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterCheckboxGroupController', FilterCheckboxGroupController)
        .component('filterCheckboxGroup', {
            bindings: {
                item: '<',
                selected: '<'
            },
            controller: 'FilterCheckboxGroupController',
            controllerAs: 'vm'
        });

    FilterCheckboxGroupController.$inject = ['FilterControlsDataService', '$element', '$compile', '$scope', 'Utils', 'DecisionDataService', '$state', 'DecisionNotificationService'];

    function FilterCheckboxGroupController(FilterControlsDataService, $element, $compile, $scope, Utils, DecisionDataService, $state, DecisionNotificationService) {
        var
            vm = this,
            sendObj = {
                'operator': 'OR'
            },
            checkedValues = [];

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            sendObj = {
                'type': 'AllInQuery',
                'characteristicId': vm.item.id,
                'operator': 'OR'
            };

            // Lazy options
            if (vm.item.lazyOptions === true) {
                vm.filterSpinner = true;
                getLazyOptions($state.params.id, vm.item.id);
                return;
            }

            renderItem(vm.item);
        }

        function onChanges(changes) {
            if (changes.selected && !angular.equals(changes.selected.currentValue, changes.selected.previousValue)) {
                selectCheckboxes(angular.copy(changes.selected.currentValue));
            }

            // TODO: check and/or, simplify logic
            if (changes.item && !angular.equals(changes.item.currentValue, changes.item.previousValue)) {

                if (changes.item.previousValue.selectedOperator === changes.item.currentValue.selectedOperator) {
                    return;
                }

                var switcherEl = $($element).find('.js-switcher-checkbox');
                if (changes.item.currentValue.selectedOperator === 'AND') {
                    switcherEl.prop('checked', false);
                    sendObj.operator = changes.item.currentValue.selectedOperator;
                } else {
                    switcherEl.prop('checked', true);
                    sendObj.operator = 'OR';
                }
            }
        }

        function renderItem(item) {
            var html = renderCheckboxes(item);
            $element.html(html);
            $compile($element.contents())($scope);
        }

        function getLazyOptions(id, optionId) {
            return DecisionDataService.getCharacteristicOptionsById(id, optionId)
                .then(function(resp) {
                    vm.item.options = resp;
                    vm.filterSpinner = false;
                    renderItem(vm.item);
                    DecisionNotificationService.notifyUpdateMatrixSize();
                    return resp;
                });
        }

        // TODO:
        // Realy need jQuery? or slow ng-repeat
        function selectCheckboxes(list) {
            if (_.isEmpty(list)) {
                checkedValues = [];
                $($element).find('.filter-item-checkbox input.js-checkbox:checked').prop('checked', false);
            } else {
                checkedValues = list;
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
            var options = _.sortBy(item.options, 'name');

            // console.log(item);
            var content = _.map(options, function(option) {

                var checked = '';
                if (_.includes(item.selectedValue, option.value)) {
                    checked = ' checked';
                }
                var html = [
                    '<div class="filter-item-checkbox">',
                    '   <input class="js-checkbox" type="checkbox" id="' + item.id + '-option-' + option.id + '" name="option-' + option.id + '" value="' + option.value + '"' + checked + '>',
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
            if (item.multiValue === true) {
                queryTypeHtml = [
                    '<div class="switcher">',
                    '<input type="checkbox" name="switcher" class="switcher-checkbox js-switcher-checkbox" id="toggle-' + item.id + '" checked>',
                    '<label class="switcher-label" for="toggle-' + item.id + '">',
                    '<span class="switcher-inner">',
                    '   <span class="operator-before">{{ "OR" | translate }}</span>',
                    '   <span class="operator-after">{{ "AND" | translate }}</span>',
                    '</span>',
                    '<span class="switcher-switch"></span>',
                    '</label>',
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
                '<div ng-show="vm.filterSpinner" class="app-loader-small"><span></span></div>'
            ].join('\n');

            return html;
        }

        $($element).on('change', '.filter-item-checkbox input.js-checkbox', function() {
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
            var sendObjCopy = angular.copy(sendObj);
            sendRequestDebounce(sendObjCopy);
        });

        $($element).on('change', '.query-type-wrapper input.js-switcher-checkbox', function() {
            if ($(this).is(':checked')) {
                sendObj.operator = 'OR';
            } else {
                sendObj.operator = 'AND';
            }
            sendObj.value = checkedValues;
            if (!_.isEmpty(sendObj.value)) {
                var sendObjCopy = angular.copy(sendObj);
                sendRequestDebounce(sendObjCopy);
            }
        });
        // END Control Checkboxes
        var sendRequestDebounce = _.debounce(sendRequest, 100);

        function sendRequest(sendObjCopy) {
            FilterControlsDataService.createFilterQuery(sendObjCopy);
        }

    }
})();