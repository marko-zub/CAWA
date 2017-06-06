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

        function onInit() {
            // console.log(vm.value, vm.type);
            var renderContent = ContentFormaterService.getTemplate(vm.item.value, vm.characteristic.valueType, vm.item.description, vm.characteristic.visualMode);
            renderHtml(renderContent);
        }

        function renderHtml(data) {
            if(_.isEmpty(data)) return;
            $element.html(data.html);
            if (data.compile) $compile($element.contents())($scope);
        }

    }
})();