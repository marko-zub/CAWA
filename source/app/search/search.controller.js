(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$rootScope', '$state', '$stateParams', 'DecisionDataService', 'DecisionsUtils', 'PaginatorConstant'];

    function SearchController($rootScope, $state, $stateParams, DecisionDataService, DecisionsUtils, PaginatorConstant) {
        var vm = this;
        vm.noResult = false;

        vm.query = $stateParams.query || '';
        $rootScope.pageTitle = 'Search' + ' | DecisionWanted.com';

        init();

        function init() {
            console.log('Search controller');
            // console.log($stateParams);
            initPagination();
            getSearch(vm.query);
        }

        function getSearch(query, pagination) {
            if (!query) vm.noResult = true;
            query = cleanQuery(query);

            var searchData = {
                query: query,
                pageNumber: 0,
                pageSize: 10
            };
            if (pagination) {
                searchData.pageNumber = pagination.pageNumber - 1;
                searchData.pageSize = pagination.pageSize;
            }

            return DecisionDataService.searchDecisions(searchData).then(function(result) {
                vm.decisionsList = DecisionsUtils.descriptionTrustHtml(result.decisions);
                vm.noResult = !vm.decisionsList.length;
                changePaginationTotal(result.totalDecisions);
                return result;
            }, function(err) {
                console.log(err);
            });
        }

        function cleanQuery(val) {
            if (!val) return;
            // val = val.toString();
            return val;
        }


        // TODO: move to component
        vm.changePageSize = changePageSize;
        vm.changePage = changePage;

        function changePageSize() {
            vm.pagination.pageNumber = 1;
            getSearch(vm.query, vm.pagination);
        }

        function changePage() {
            getSearch(vm.query, vm.pagination);
        }

        function initPagination() {
            vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;

            vm.pagination = {
                pageNumber:  1,
                pageSize:  10,
                totalDecisions: 10
            };
        }

        function changePaginationTotal(total) {
            vm.pagination.totalDecisions = total;
        }

    }
})();