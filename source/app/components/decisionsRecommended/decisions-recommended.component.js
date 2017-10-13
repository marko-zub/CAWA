(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('DecisionsRecommendedController', DecisionsRecommendedController)
        .component('decisionsRecommended', {
            templateUrl: 'app/components/decisionsRecommended/decisions-recommended.html',
            bindings: {
                decisionId: '<'
            },
            controller: 'DecisionsRecommendedController',
            controllerAs: 'vm',
        });


    DecisionsRecommendedController.$inject = ['$sce'];

    function DecisionsRecommendedController($sce) {
        var
            vm = this;

        vm.$onInit = onInit;

        function onInit() {
            getRecommendedDecision(vm.decisionId);
        }

        function getRecommendedDecision(id) {
            if(!_.isNumber(id)) return;
        }
    }
})();