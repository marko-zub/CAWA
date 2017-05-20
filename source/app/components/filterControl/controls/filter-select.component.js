(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterSelectController', FilterSelectController)
        .component('filterSelect', {
            bindings: {
                item: '<',
                selected: '<'
            },
            controller: 'FilterSelectController',
            controllerAs: 'vm'
        });

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
            $element.html(html);
            $compile($element.contents())($scope);
        }

        function onChanges(changes) {
            if (!angular.equals(changes.selected.currentValue, changes.selected.previousValue)) {
                vm.selected = !_.isEmpty(changes.selected.currentValue) ? changes.selected.currentValue : selectAllObj.value;
            }
        }

        // Contorl SELECT
        function renderSelect(item) {
            if(!item) return;
            var options = _.sortBy(item.options, 'name');
            options.unshift(selectAllObj);
            var content = _.map(options, function(option) {
                return '<option value="' + _.escape(option.value) + '">' + option.name + '</option>';
            });

            var html = [
                '<div class="filter-item-wrapper">',
                '<select class="form-control input-sm" ng-model="vm.selected" ng-model-options="vm.controlOptions" ng-change="vm.changeSelect(vm.selected)">',
                content.join('\n'),
                '</select>',
                '</div>'
            ].join('\n');
            return html;
        }

        function changeSelect(model) {
            if (model === 'null') model = null;
            var sendObj = {
                "type": "EqualQuery",
                "characteristicName": vm.item.name,
                "characteristicId": vm.item.id,
                "value": _.unescape(model),
            };
            FilterControlsDataService.createFilterQuery(sendObj);
        }

    }
})();