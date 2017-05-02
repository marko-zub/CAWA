(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ContentFormaterController', ContentFormaterController)
        .component('contentFormater', {
            template: renderTemplate,
            bindings: {
                item: '<',
            },
            controller: 'ContentFormaterController',
            controllerAs: 'vm'
        });


    renderTemplate.$inject = [];

    function renderTemplate() {
        return '<div ng-bind-html="::vm.html"></div>';
    }

    ContentFormaterController.$inject = ['ContentFormaterService'];

    function ContentFormaterController(ContentFormaterService) {
        var
            vm = this;

        vm.$onInit = onInit;

        function onInit() {
            // console.log('init');
            vm.item = _.pick(vm.item, 'value', 'valueType');
            var renderContent = vm.item && vm.item.value ? ContentFormaterService.getTemplate(vm.item) : '';
            if (renderContent) {
                vm.html = renderContent;
            }
        }

    }
})();