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
            sendObj,
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
                // console.log(vm.item);
                vm.filterSpinner = true;
                // console.log($state)
                getLazyOptions($state.params.id, vm.item.id);
                return;
            }

            renderItem(vm.item);
        }

        function onChanges(changes) {
            if (changes.selected && !angular.equals(changes.selected.currentValue, changes.selected.previousValue)) {
                selectCheckboxes(changes.selected.currentValue);
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
        // Realy need Juqery? or slow ng-repeat
        function selectCheckboxes(list) {
            checkedValues = !_.isEmpty(list) ? list : [];
            if (_.isNull(list)) {
                $($element).find('.filter-item-checkbox input.js-checkbox:checked').prop('checked', false);
                return;
            }
            $($element).find('.filter-item-checkbox input.js-checkbox').each(function() {
                var val = $(this).val();
                if (_.includes(list, val)) {
                    $(this).prop('checked', true);
                } else {
                    $(this).prop('checked', false);
                }
            });
        }

        function renderCheckboxes(item) {
            // String Array type
            var options = _.sortBy(item.options, 'name');

            var content = _.map(options, function(option) {
                var html = [
                    '<div class="filter-item-checkbox">',
                    '<input class="js-checkbox" type="checkbox" id="option-' + option.id + '" name="option-' + option.id + '" value="' + option.value + '">',
                    '<label for="option-' + option.id + '">' + option.value + '</label>',
                    '</div>'
                ];
                return html.join('\n');
            }).join('\n');

            var queryTypeHtml = [
                '<div class="switcher">',
                    '<div class="switcher-label">',
                        '<div class="switcher-text-label">OR</div>',
                    '</div>',
                '</div>',
            ].join('\n');

            // Allow multiply values switcher OR/AND
            // if (item.valueType === 'STRING') {
            if (item.multiValue === true) {
                queryTypeHtml = [
                    '<div class="switcher">',
                    '<input type="checkbox" name="switcher" class="switcher-checkbox js-switcher-checkbox" id="toggle-' + item.id + '" checked>',
                    '<label class="switcher-label" for="toggle-' + item.id + '">',
                    '<span class="switcher-inner"></span>',
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
                '<div>',
                content,
                '</div>',
                '</div>',
                '<div ng-show="vm.filterSpinner" class="app-loader-small"><span class="glyphicon glyphicon-refresh app-loader-animation"></span>LOADING...</div>'
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

            if (!_.isEmpty(sendObj.value)) {
                var sendObjCopy = angular.copy(sendObj);
                sendRequestDebounce(sendObjCopy);
            }
        });
        // END Control Checkboxes

        var sendRequestDebounce = _.debounce(sendRequest, 100);
        // var sendRequestDebounce = _.debounce(sendRequest, 300, {leading: true});

        function sendRequest(sendObjCopy) {
            FilterControlsDataService.createFilterQuery(sendObjCopy);
        }

    }
})();