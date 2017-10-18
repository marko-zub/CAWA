(function() {

    'use strict';

    angular.module('app.decision')
        .controller('DecisionMatrixController', DecisionMatrixController);

    DecisionMatrixController.$inject = ['decisionBasicInfo', '$rootScope', 'Config'];

    function DecisionMatrixController(decisionBasicInfo, $rootScope, Config) {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            vm.decision = decisionBasicInfo || {};
            $rootScope.pageTitle = vm.decision.name + ' Comparison Matrix | ' + Config.pagePrefix;
        }
    }
})();