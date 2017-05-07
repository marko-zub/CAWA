(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterSelectController', FilterSelectController)
        .component('filterSelect', {
            bindings: {
                item: '<',
            },
            controller: 'FilterSelectController',
            controllerAs: 'vm'
        });

    FilterSelectController.$inject = ['FilterControlsDataService', '$element', '$compile', '$scope'];

    function FilterSelectController(FilterControlsDataService, $element, $compile, $scope) {
        var
            vm = this,
            selectAllObj = {
                characteristicId: null,
                characteristicOptionId: '*',
                createDate: null,
                description: null,
                name: 'All',
                value: 'null'
            };

        vm.changeSelect = changeSelect;

        vm.$onInit = onInit;

        function onInit() {
            // debugger
            var html = renderSelect(vm.item);
            $element.html(html);
            $compile($element.contents())($scope);            
        }

        // Contorl SELECT
        function renderSelect(item) {
            if(!item) return;
            vm.select = 'null';
            var options = _.sortBy(item.options, 'name');
            options.unshift(selectAllObj);
            var content = [];
            _.forEach(options, function(option) {
                var optionHtml = '<option value="' + option.value + '">' + option.name + '</option>';
                content.push(optionHtml);
            });

            var html = [
                '<div class="filter-item-wrapper">',
                '<select class="form-control input-sm" ng-model="vm.select" ng-model-options="vm.controlOptions" ng-change="vm.changeSelect(vm.select)">',
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
                "characteristicId": vm.item.characteristicId,
                "value": model,
            };
            FilterControlsDataService.createFilterQuery(sendObj);
        }

    }
})();