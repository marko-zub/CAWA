(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CompareButtonController', CompareButtonController)
        .component('compareButton', {
            templateUrl: 'app/components/compare/compare-button.html',
            bindings: {
                decision: '<',
                parentDecision: '<'
            },
            controller: 'CompareButtonController',
            controllerAs: 'vm'
        });

    CompareButtonController.$inject = ['DecisionCompareNotificationService'];

    function CompareButtonController(DecisionCompareNotificationService) {
        var
            vm = this;

        vm.$onInit = onInit;

        function onInit () {
            // console.log(vm.decision);
            // console.log(vm.parentDecision);
        }

        vm.addToCompareList = addToCompareList;

        function addToCompareList(decision) {
            decision.parentDecision = vm.parentDecision;
            DecisionCompareNotificationService.notifyUpdateDecisionCompare(decision);
            decision.isInCompareList = true;
        }    
          
    }
})();