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
                comments: '<'
            },
            controller: 'CharacteristicsListController',
            controllerAs: 'vm',
        });


    CharacteristicsListController.$inject = [];

    function CharacteristicsListController() {
        var
            vm = this;
            
        vm.$onInit = onInit;
        function onInit() {
            if(!!vm.links) vm.links = true;
            if(!!vm.comments) vm.comments = false;
        }
    }
})();