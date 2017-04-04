(function() {

    'user strict';

    angular
        .module('app.decision')
        .controller('DecisionsController', DecisionsController);

    DecisionsController.$inject = ['DecisionDataService', '$sce', '$rootScope', '$state', '$stateParams', 'PaginatorConstant'];

    function DecisionsController(DecisionDataService, $sce, $rootScope, $state, $stateParams, PaginatorConstant) {
        var
            vm = this;

        vm.changePageSize = changePageSize;
        vm.changePage = changePage;
        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;

        vm.pagination = {
            pageNumber: parseInt($stateParams.page) || 1,
            pageSize: parseInt($stateParams.size) || 10
        };

        init();

        function init() {
            console.log('Decisions controller');

            $rootScope.pageTitle = 'Decisions' + ' | DecisionWanted';

            var data = vm.pagination;

            // TODO: pick allowed values
            if($stateParams.sort) data.sort = $stateParams.sort;
            data.sortDirection = $stateParams.sortDirection || 'DESC';

            getDecisions(data);
        }

        function getDecisions(data) {
            vm.decisionsSpinner = true;
            var pagination = _.clone(vm.pagination);
            pagination.pageNumber = pagination.pageNumber - 1;

            DecisionDataService.getDecisions(pagination).then(function(result) {
                vm.decisionsList = descriptionTrustHtml(result.decisions);
                initPagination(result.totalDecisions);
                vm.decisionsSpinner = false;
            }, function(error) {
                console.log(error);
            });
        }

        // Move to Utils
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                el.description = $sce.trustAsHtml(el.description);
                return el;
            });
        }

        // Pagination
        function changePageSize() {
            vm.pagination.pageNumber = 1;
            getDecisions(vm.pagination);
            updateStateParams();
        }

        function changePage() {
            getDecisions(vm.pagination);
            updateStateParams();
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

        function initPagination(total) {
            vm.pagination.totalDecisions = total || 10;
        }
    }
})();