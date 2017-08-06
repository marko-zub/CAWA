(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionNominationsController', DecisionNominationsController);

    DecisionNominationsController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', 'DecisionsConstant',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce', '$q', 'ContentFormaterService'
    ];

    function DecisionNominationsController($rootScope, decisionBasicInfo, DecisionDataService, DecisionsConstant,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce, $q, ContentFormaterService) {

        var
            vm = this;

        vm.decision = decisionBasicInfo || {};

        vm.$onInit = onInit;

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            console.log('Decision Nominations Controller');
            getDecisionParents(vm.decision.id);
            setPageData();
        }

        function setPageData() {
            $rootScope.pageTitle = vm.decision.name + ' Nominations | DecisionWanted.com';

            $rootScope.breadcrumbs = [{
                title: 'Decisions',
                link: 'decisions'
            }, {
                title: vm.decision.name,
                link: 'decisions.single'
            }, {
                title: 'Nominations',
                link: null
            }];
        }

        function getDecisionParents(id) {
            DecisionDataService.getDecisionParents(id).then(function(result) {
                // console.log(result);
                vm.decisionParents = result;

                if (vm.decision.totalChildDecisions > 0) {
                    vm.isDecisionsParent = true;
                    vm.decisionsSpinnerChilds = true;
                }

                return result;
            });
        }


    }
})();