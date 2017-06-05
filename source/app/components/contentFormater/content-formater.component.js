(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ContentFormaterController', ContentFormaterController)
        .component('contentFormater', {
            bindings: {
                item: '<',
                type: '<',
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
            var renderContent = ContentFormaterService.getTemplate(vm.item.value, vm.type, vm.item.description);
            renderHtml(renderContent);
        }

        function renderHtml(data) {
            $element.html(data.html);
            if (data.compile) $compile($element.contents())($scope);
        }

    }
})();