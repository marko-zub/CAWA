(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ContentFormaterController', ContentFormaterController)
        .component('contentFormater', {
            bindings: {
                item: '<',
            },
            controller: 'ContentFormaterController',
            controllerAs: 'vm'
        });

    ContentFormaterController.$inject = ['ContentFormaterService', '$element', '$compile', '$scope'];

    function ContentFormaterController(ContentFormaterService, $element, $compile, $scope) {
        var
            vm = this,
            renderContent;

        vm.$onInit = onInit;

        // Create additional watcher
        // vm.$onChanges = onChanges;

        function onInit() {
            // console.log('init');
            vm.item = _.pick(vm.item, 'value', 'valueType');
            var renderContent = vm.item && vm.item.value ? ContentFormaterService.getTemplate(vm.item) : '';
            if (renderContent) renderHtml(renderContent);
        }

        // function onChanges(changes) {
        //     console.log(changes);
        //     if (changes.item.currentValue &&
        //         !angular.equals(changes.item.currentValue, changes.item.previousValue)) {
        //         vm.item = _.pick(changes.item.currentValue, 'value', 'valueType');
        //         var renderContent = vm.item && vm.item.value ? ContentFormaterService.getTemplate(vm.item) : '';
        //         if (renderContent) renderHtml(renderContent);
        //     }
        // }

        function renderHtml(html) {
            $element.html(html);
            $compile($element.contents())($scope);
        }

    }
})();