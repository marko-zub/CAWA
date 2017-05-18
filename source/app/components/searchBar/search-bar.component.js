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

    SearchBarController.$inject = ['$element', 'DecisionDataService', '$state', '$rootScope', '$stateParams'];

    function SearchBarController($element, DecisionDataService, $state, $rootScope, $stateParams) {
        var
            vm = this,
            value;

        vm.search = search;
        vm.searchSuggestedDecisions = searchSuggestedDecisions;
        vm.selectSuggestedDecisions = selectSuggestedDecisions;
        vm.shouldSelectSuggestedDecisions = shouldSelectSuggestedDecisions;
        vm.clearValue = clearValue;

        vm.$onInit = onInit;

        function onInit() {
            vm.searchQuery = $stateParams.query ? decodeURI($stateParams.query) : null;
            vm.searchOptions = {
                debounce: 50
            };
        }

        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                vm.searchQuery = toParams.query ? decodeURI(toParams.query) : null;
            });

        function search() {
            changeState(vm.searchQuer);
        }

        function clearValue() {
            vm.searchQuery = null;
            $('#header-search').focus();
        }

        function shouldSelectSuggestedDecisions($event, model) {
            var query;
            if ($event.keyCode === 13) {
                if (!vm.searchQuery) return;
                var sendQuery = _.isObject(vm.searchQuery) ? vm.searchQuery.name : vm.searchQuery;
                query = cleanQuery(sendQuery);
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
                return decisions;
            });
        }

        function cleanQuery(val) {
            if (!val) return;
            // val = encodeURI(val.toString());
            // // TODO: clean query
            return val;
        }

    }
})();