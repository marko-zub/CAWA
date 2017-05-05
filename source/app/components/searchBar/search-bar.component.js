(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('SearchBarController', SearchBarController)
        .component('searchBar', {
            templateUrl: 'app/components/searchBar/search-bar.html',
            bindings: {
                placeholder: '@',
            },
            controller: 'SearchBarController',
            controllerAs: 'vm'
        });

    SearchBarController.$inject = ['$element', 'DecisionDataService', '$state'];

    function SearchBarController($element, DecisionDataService, $state) {
        var
            vm = this,
            value;

        vm.search = search;
        vm.searchSuggestedDecisions = searchSuggestedDecisions;
        vm.selectSuggestedDecisions = selectSuggestedDecisions;
        vm.shouldSelectSuggestedDecisions = shouldSelectSuggestedDecisions;
        // console.log(vm.placeholder);

        vm.searchOptions = {
            debounce: 50
        };

        function search() {
            changeState(vm.searchQuer);
        }

        function shouldSelectSuggestedDecisions($event, model) {
            // console.log($event);
            // return true;
            var code = $event.keyCode;
            if (code === 13) {
                var query = cleanQuery(vm.searchQuery);
                changeState(query);
                $event.preventDefault();
            }
        }

        function selectSuggestedDecisions($item, $model) {
            changeState($item.name.toString());
        }

        function changeState(queryVal) {
            if (!queryVal) return;
            var sendQuery = cleanQuery(queryVal);
            $state.go('search', {
                query: sendQuery
            });
        }

        function searchSuggestedDecisions(query) {
            if (!query) vm.noResult = true;
            query = cleanQuery(query);
            var searchData = {
                query: query,
                pageNumber: 0,
                pageSize: 20
            };
            return DecisionDataService.searchSuggestedDecisions(searchData).then(function(resp) {
                var decisions = resp.decisions;
                // console.log(resp);
                return decisions;
            });
        }

        function cleanQuery(val) {
            if (!val) return;
            val = escape(val.toString());
            // TODO: clean query
            return val;
        }

    }
})();