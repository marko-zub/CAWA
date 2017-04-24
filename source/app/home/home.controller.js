(function() {

    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['DecisionDataService', '$state'];

    function HomeController(DecisionDataService, $state) {
        var vm = this;

        console.log('Home controller');

        vm.search = search;

        function search() {
            vm.showTrigger = true;
        }

        vm.searchOptions = {
            debounce: 300
        };

        vm.searchSuggestedDecisions = searchSuggestedDecisions;
        vm.selectSuggestedDecisions = selectSuggestedDecisions;

        function selectSuggestedDecisions($item, $model) {
            // console.log($item, $model)
            $state.go('decisions.single', {id: $item.decisionId, slug: $item.nameSlug});
        }

        function searchSuggestedDecisions(value) {
            var searchData = {
                query: value,
                pageNumber: 0,
                pageSize: 10
            };
            return DecisionDataService.searchSuggestedDecisions(searchData).then(function(resp) {
                var decisions = resp.decisions;
                // console.log(resp);
                return decisions;
            });
        }
    }
})();