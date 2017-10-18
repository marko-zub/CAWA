(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$rootScope', '$state', '$stateParams', 'DecisionDataService', 'DecisionsUtils', 'PaginatioService'];

    function SearchController($rootScope, $state, $stateParams, DecisionDataService, DecisionsUtils, PaginatioService) {
        var vm = this;
        vm.noResult = false;

        vm.query = $stateParams.query || '';
        $rootScope.pageTitle = 'Search' + ' | DecisionWanted.com';

        vm.$onInit = onInit;

        function onInit() {
            var pagination = PaginatioService.initPagination();
            getSearch(vm.query, pagination);
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
                vm.decisions = result.decisions;
                vm.noResult = !vm.decisions.length;
                vm.pagination = PaginatioService.initPagination(result.totalDecisions);
                return result;
            }, function(err) {
                console.log(err);
            });
        }

        function cleanQuery(val) {
            if (val) return val;
        }

        vm.changePageSize = changePageSize;
        vm.changePage = changePage;

        function changePageSize(pagination) {
            getSearch(vm.query, pagination);
        }

        function changePage(pagination) {
            getSearch(vm.query, pagination);
        }

    }
})();