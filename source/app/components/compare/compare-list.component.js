(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CompareListontrollerController', CompareListontrollerController)
        .component('compareList', {
            templateUrl: 'app/components/compare/compare-list.html',
            bindings: {
                list: '<'
            },
            controller: 'CompareListontrollerController',
            controllerAs: 'vm'
        });

    CompareListontrollerController.$inject = ['DecisionCompareService', 'DecisionCompareNotificationService'];

    function CompareListontrollerController(DecisionCompareService, DecisionCompareNotificationService) {
        var
            vm = this;

    }
})();