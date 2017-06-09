(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterSelectController', FilterSelectController)
        .component('filterSelect', {
            // template: renderTemplate,
            bindings: {
                item: '<',
                selected: '<'
            },
            controller: 'FilterSelectController',
            controllerAs: 'vm'
        });

    // renderTemplate.$inject = [];

    // function renderTemplate() {

    // }

    FilterSelectController.$inject = ['FilterControlsDataService', '$element', '$compile', '$scope'];

    function FilterSelectController(FilterControlsDataService, $element, $compile, $scope) {
        var
            vm = this,
            selectAllObj = {
                id: null,
                characteristicOptionId: '*',
                createDate: null,
                description: null,
                name: 'All',
                value: 'all'
            };

        vm.controlOptions = {
            debounce: 50
        };

        vm.changeSelect = changeSelect;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            // debugger
            vm.selected = !_.isEmpty(vm.selected) ? vm.selected : selectAllObj.value;
            var html = renderSelect(vm.item);
            // console.log(vm.item);
            $element.html(html);
            $compile($element.contents())($scope);
        }

        function onChanges(changes) {
            if (changes.item && !angular.equals(changes.item.currentValue, changes.item.previousValue)) {
                var html = renderSelect(vm.item);
                // console.log(vm.item);
                $element.html(html);
                $compile($element.contents())($scope);
            }

            if (changes.selected && !angular.equals(changes.selected.currentValue, changes.selected.previousValue)) {
                var selected = !_.isEmpty(changes.selected.currentValue) ? changes.selected.currentValue : selectAllObj.value;

                vm.selectModel = {
                    value: selected
                };
            }
        }

        // Contorl SELECT
        function renderSelect(item) {
            if (!item) return;
            var options = _.sortBy(item.options, 'name');
            options.unshift(selectAllObj);
            // var content = _.map(options, function(option) {
            //     // ng-model => options[index]
            //     return '<option ng-value="' + _.escape(option.value) + '" data-option-id="' + option.id + '">' + option.name + '</option>';
            // });

            vm.options = options;
            var html = [
                '<div class="filter-item-wrapper">',
                '<select class="form-control input-sm" ng-model="vm.selectModel" ng-options="option as option.value for option in vm.options" ng-model-options="vm.controlOptions" ng-change="vm.changeSelect(vm.selectModel)" ng-disabled="vm.item.disabled">',
                // content.join('\n'),
                '</select>',
                '</div>'
            ].join('\n');
            return html;
        }

        function changeSelect(model) {
            var sendObj = {
                'type': 'EqualQuery',
                'characteristicName': vm.item.name,
                'characteristicId': vm.item.id,
                'value':  (model && !_.isNull(model.value)) ? _.unescape(model.value) : null
            };
            // console.log(model);
            // console.log(sendObj);
            //
            if(!model) model = {id:null};
            FilterControlsDataService.createFilterQuery(sendObj, model.id);
        }

    }
})();