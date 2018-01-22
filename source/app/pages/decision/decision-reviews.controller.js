(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionReviewsController', DecisionReviewsController);

    DecisionReviewsController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionsUtils'];

    function DecisionReviewsController($rootScope, decisionBasicInfo, DecisionsUtils) {

        var vm = this;

        vm.decision = DecisionsUtils.prepareDecisionLogoToUI(decisionBasicInfo) || {};

        vm.$onInit = onInit;

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            vm.decisionParents = vm.decision.parentDecisions;
            if (vm.decision.totalChildDecisions > 0) {
                vm.isDecisionsParent = true;
                vm.decisionsLoaderChilds = true;
            }

            setPageData();
        }

        function setPageData() {
            $rootScope.pageTitle = vm.decision.name + ' Reviews | DecisionWanted.com';

            $rootScope.breadcrumbs = [{
                title: 'Decisions',
                link: 'decisions'
            }, {
                title: vm.decision.name,
                link: 'decisions.single'
            }, {
                title: 'Reviews',
                link: null
            }];
        }

    }
})();