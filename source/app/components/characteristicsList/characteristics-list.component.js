(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CharacteristicsListController', CharacteristicsListController)
        .component('characteristicsList', {
            templateUrl: 'app/components/characteristicsList/characteristics-list.html',
            bindings: {
                list: '<',
                links: '<',
                comments: '<',
                rating: '<',
                collapsed: '<',
                discussion: '<'
            },
            controller: 'CharacteristicsListController',
            controllerAs: 'vm',
        });


    CharacteristicsListController.$inject = [];

    function CharacteristicsListController() {
        var vm = this;

        vm.$onInit = onInit;
        function onInit() {
            if(!!vm.links) vm.links = true;
            if(!!vm.comments) vm.comments = false;
            if (!vm.rating) vm.rating = false;
            if(vm.discussion !== true) vm.discussion = false;
            if (vm.collapsed !== false) vm.collapsed = true;
        }

        vm.toggleCollapse = toggleCollapse;
        function toggleCollapse(index) {
            if (vm.collapsed === false) return;
            vm.list[index].isCollapsed = !vm.list[index].isCollapsed;
        }
    }
})();