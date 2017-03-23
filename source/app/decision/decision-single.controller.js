(function() {

    'user strict';

    angular
        .module('app.decision')
        .controller('DecisionSingleController', DecisionSingleController);

    DecisionSingleController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce'];

    function DecisionSingleController($rootScope, decisionBasicInfo, DecisionDataService, $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce) {
        var
            vm = this,
            isInitedSorters = false,
            defaultDecisionCount = 10;

        vm.decisionId = $stateParams.id;
        vm.decisionsList = [];
        vm.updateDecisionList = [];
        vm.decision = decisionBasicInfo || {};

        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;
        vm.changePageSize = changePageSize;
        vm.changePage = changePage;

        $rootScope.pageTitle = vm.decision.name + ' | DecisionWanted';

        $rootScope.breadcrumbs = [{
            title: 'Decisions',
            link: 'decisions'
        }, {
            title: vm.decision.name,
            link: null
        }];

        init();

        function init() {
            console.log('Decision Single Controller');
            setPagination();
            searchDecisionNomimations($stateParams.id);
        }

        function searchDecisionNomimations(id) {
            if (!id) return;

            var pagination = _.clone(vm.pagination);
            pagination.pageNumber = pagination.pageNumber - 1;

            DecisionDataService.searchDecisionNomination(id, pagination).then(function(result) {
                vm.decisions = descriptionTrustHtml(result.decisions);
                vm.pagination.totalDecisions = result.totalDecisions;
                // console.log(result);
            });
        }

        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                el.description = $sce.trustAsHtml(el.description);
               return el;
            });
        }

        function changePageSize() {
            vm.pagination.pageNumber = 1;
            searchDecisionNomimations($stateParams.id);
            updateStateParams();
        }

        function changePage() {
            searchDecisionNomimations($stateParams.id);
            updateStateParams();
        }

        function setPagination() {
            vm.pagination = {
                pageNumber: parseInt($stateParams.page) || 1,
                pageSize: parseInt($stateParams.size) || 10,
                totalDecisions: vm.decision.totalChildDecisions || 10
            };
            // updateStateParams();
        }

        function updateStateParams() {
            $state.go($state.current.name, {
                page: vm.pagination.pageNumber,
                size: vm.pagination.pageSize
            }, {
                notify: false,
                reload: false,
                location: 'replace'
            });
        }

    }
})();