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


    DecisionShortInfoController.$inject = [];

    function DecisionShortInfoController() {
        // var
        //     vm = this;
    }
})();