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

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            // console.log(vm.value, vm.type);
            if (vm.item) {
                var renderContent = ContentFormaterService.getTemplate(vm.item.value, vm.characteristic.valueType, vm.item.description, vm.characteristic.visualMode);
                renderHtml(renderContent);
            }
        }

        function onChanges(changes) {
            if (changes.item && !angular.equals(changes.item.currentValue, changes.previousValue)) {
                var renderContent = ContentFormaterService.getTemplate(changes.item.currentValue.value, vm.characteristic.valueType, changes.item.currentValue.description, vm.characteristic.visualMode);
                renderHtml(renderContent);
                // console.log(changes.item.currentValue);
            }
        }

        function renderHtml(data) {
            if (_.isEmpty(data)) return;
            $element.html(data.html);
            if (data.compile) $compile($element.contents())($scope);
        }

    }
})();