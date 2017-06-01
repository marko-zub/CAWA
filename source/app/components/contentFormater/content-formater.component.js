(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ContentFormaterController', ContentFormaterController)
        .component('contentFormater', {
            bindings: {
                value: '<',
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

        // Create additional watcher
        // vm.$onChanges = onChanges;

        function onInit() {
            // console.log(vm.value, vm.type);
            var renderContent = ContentFormaterService.getTemplate(vm.value, vm.type);
            if(!_.isBoolean(renderContent) && !_.isEmpty(renderContent)) renderHtml(renderContent);
        }

        // function onChanges(changes) {
        //     console.log(changes);
        //     if (changes.value.currentValue &&
        //         !angular.equals(changes.value.currentValue, changes.value.previousValue)) {
        //         vm.value = _.pick(changes.value.currentValue, 'value', 'valueType');
        //         var renderContent = vm.value && vm.value.value ? ContentFormaterService.getTemplate(vm.value) : '';
        //         if (renderContent) renderHtml(renderContent);
        //     }
        // }

        function renderHtml(html) {
            $element.html(html);
            $compile($element.contents())($scope);
        }

    }
})();