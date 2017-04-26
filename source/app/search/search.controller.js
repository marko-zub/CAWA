(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$rootScope', '$state', '$stateParams', 'DecisionDataService'];

    function SearchController($rootScope, $state, $stateParams, DecisionDataService) {
        var vm = this;
        vm.noResult = false;

        $rootScope.pageTitle = 'Search' + ' | DecisionWanted';

        init();

        function init() {
            console.log('Search controller');
            // console.log($stateParams);
            if ($stateParams.query) getSearch($stateParams.query);
        }

        function getSearch(query) {
            if (!query) vm.noResult = true;
            query = cleanQuery(query);
            var searchData = {
                query: query,
                pageNumber: 0,
                pageSize: 10
            };

            DecisionDataService.searchDecisions(searchData).then(function(resp){
                console.log(resp);
                vm.decisions = resp.decisions;
                vm.noResult = !vm.decisions.length;
                console.log(vm.noResult);
            }, function(err) {
                console.log(err);
            });
        }

        function cleanQuery(val) {
            val = val.toString();
            return window.encodeURIComponent(val);
        }

    }
})();