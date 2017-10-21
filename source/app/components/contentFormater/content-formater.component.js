(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ContentFormaterController', ContentFormaterController)
        .component('contentFormater', {
            bindings: {
                item: '<',
                characteristic: '<',
            },
            controller: 'ContentFormaterController',
            controllerAs: 'vm'
        });

    ContentFormaterController.$inject = ['ContentFormaterService', '$element', '$compile', '$scope'];

    function ContentFormaterController(ContentFormaterService, $element, $compile, $scope) {
        var
            vm = this;

        vm.$onChanges = onChanges;

        function onChanges(changes) {
            if (changes.item && !angular.equals(changes.item.currentValue, changes.previousValue)) {
                // console.log(changes.item.currentValue);
                var item = {
                    value: changes.item.currentValue.value,
                    multiValue: vm.characteristic.multiValue,
                    valueType: vm.characteristic.valueType,
                    description: changes.item.currentValue.description,
                    totalHistoryValues: changes.item.currentValue.totalHistoryValues,
                    visualMode: vm.characteristic.visualMode
                };
                var renderContent = ContentFormaterService.getTemplate(item);
                renderHtml(renderContent);
            }
        }

        function renderHtml(data) {
            if (_.isEmpty(data)) return;
            $element.html(data.html);
            if (data.compile) $compile($element.contents())($scope);
        }

    }
})();