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

    FilterCheckboxGroupController.$inject = ['FilterControlsDataService', '$element', '$compile', '$scope', 'Utils'];

    function FilterCheckboxGroupController(FilterControlsDataService, $element, $compile, $scope, Utils) {
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
            var html = renderCheckboxes(vm.item);
            $element.html(html);
            $compile($element.contents())($scope);
        }

        function onChanges(changes) {
            if (changes.selected && !angular.equals(changes.selected.currentValue, changes.selected.previousValue)) {
                selectCheckboxes(changes.selected.currentValue);
            }
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
                    '<label for="option-' + option.id + '">' + option.name + '</label>',
                    '</div>'
                ];
                return html.join('\n');
            }).join('\n');

            var queryTypeHtml = [
                '<div class="switcher">',
                '<input type="checkbox" name="switcher" class="switcher-checkbox js-switcher-checkbox" id="toggle-' + item.id + '" checked>',
                '<label class="switcher-label" for="toggle-' + item.id + '">',
                '<span class="switcher-inner"></span>',
                '<span class="switcher-switch"></span>',
                '</label>',
                '</div>',
            ].join('\n');


            var html = [
                '<div class="query-type-wrapper">',
                queryTypeHtml,
                '</div>',
                '<div class="filter-item checkbox-list" dw-scroll-bar>',
                    '<div>',
                        content,
                    '</div>',
                '</div>'
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