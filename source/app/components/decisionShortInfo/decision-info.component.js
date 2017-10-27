(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('DecisionShortInfoController', DecisionShortInfoController)
        .component('decisionShortInfo', {
            templateUrl: 'app/components/decisionShortInfo/decision-short-info.html',
            bindings: {
                decision: '<'
            },
            controller: 'DecisionShortInfoController',
            controllerAs: 'vm'
        });


    DecisionShortInfoController.$inject = ['Utils'];

    function DecisionShortInfoController(Utils) {
        var vm = this;
        vm.$onInit = onInit;

        function onInit() {
            vm.decision.createUser.reputation = Utils.numberToUi(vm.decision.createUser.reputation, 2);
        }
    }
})();