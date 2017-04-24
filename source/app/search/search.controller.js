(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('searchController', searchController);

    searchController.$inject = ['$rootScope', '$state', '$stateParams', 'DecisionDataService'];

    function searchController($rootScope, $state, $stateParams, DecisionDataService) {
        var vm = this;
        vm.noResult = false;

        $rootScope.pageTitle = 'Search' + ' | DecisionWanted';

        init();

        function init() {
        	console.log('Search controller');
        	console.log($stateParams);
        	if($stateParams.query) getSearch($stateParams.query);
        }

        function getSearch(query) {
        	if(!query) vm.noResult = true;
        	query = query.toString();
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

    }
})();