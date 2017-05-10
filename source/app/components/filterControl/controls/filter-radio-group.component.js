(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterRadioGroupController', FilterRadioGroupController)
        .component('filterRadioGroup', {
            bindings: {
                item: '<',
                selected: '<'
            },
            controller: 'FilterRadioGroupController',
            controllerAs: 'vm'
        });

    FilterRadioGroupController.$inject = ['FilterControlsDataService', '$element', '$compile', '$scope'];

    function FilterRadioGroupController(FilterControlsDataService, $element, $compile, $scope) {
        var
            vm = this;

        vm.changeRadio = changeRadio;

        vm.controlOptions = {
            debounce: 50
        };

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            var html = renderRadiogroup(vm.item);
            $element.html(html);
            $compile($element.contents())($scope);
        }

        function onChanges(changes) {
            if (!angular.equals(changes.selected.currentValue, changes.selected.previousValue)) {
                vm.radio = changes.selected.currentValue; 
            }
        }

        // Contorl RADIOGROUP
        function renderRadiogroup(item) {

            var options = [{
                value: null,
                label: 'All'
            }, {
                value: true,
                label: 'Yes'
            }, {
                value: false,
                label: 'No'
            }];

            vm.radio = options[0].value;
            var content = _.map(options, function(option) {
                return [
                    '<label class="filter-list-item">',
                    '<input ng-model-options="vm.controlOptions" ng-change="vm.changeRadio(vm.radio)" name="radio ' + item.characteristicId + '" type="radio" ng-model="vm.radio" ng-value="' + option.value + '">' + option.label + '</label>',
                    '</label>'
                ].join('\n');
            }).join('\n');

            var html = [
                '<div class="filter-item-wrapper filter-list">',
                content,
                '</div>'
            ].join('\n');
            return html;
        }

        function changeRadio(model) {
            var sendObj = {
                "type": "EqualQuery",
                "characteristicId": vm.item.characteristicId,
                "characteristicName": vm.item.name,
                "value": model
            };
            FilterControlsDataService.createFilterQuery(sendObj);
        }

    }
})();