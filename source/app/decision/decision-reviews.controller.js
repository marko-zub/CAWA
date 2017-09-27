(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionReviewsController', DecisionReviewsController);

    DecisionReviewsController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce', '$q', 'ContentFormaterService'
    ];

    function DecisionReviewsController($rootScope, decisionBasicInfo, DecisionDataService,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce, $q, ContentFormaterService) {

        var
            vm = this;

        vm.decision = decisionBasicInfo || {};

        vm.$onInit = onInit;

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            console.log('Decision Reviews Controller');
            vm.decisionParents = vm.decision.parentDecisions;
            if (vm.decision.totalChildDecisions > 0) {
                vm.isDecisionsParent = true;
                vm.decisionsSpinnerChilds = true;
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