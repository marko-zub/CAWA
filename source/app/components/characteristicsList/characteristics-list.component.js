(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CharacteristicsListController', CharacteristicsListController)
        .component('characteristicsList', {
            templateUrl: 'app/components/characteristicsList/characteristics-list.html',
            bindings: {
                list: '<'
            },
            controller: 'CharacteristicsListController',
            controllerAs: 'vm',
        });


    CharacteristicsListController.$inject = [];

    function CharacteristicsListController() {
        var
            vm = this;

            // Format content
    }
})();