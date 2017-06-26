(function() {

    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['DecisionDataService', '$rootScope', '$state', '$stateParams', 'PaginatorConstant', 'DecisionsConstant'];


    function HomeController(DecisionDataService, $rootScope, $state, $stateParams, PaginatorConstant, DecisionsConstant) {
        // TODO: this controller copy of 
        // Decisions view
        // Move decisions for separete component
        var vm = this;
        vm.search = search;

        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;

        vm.pagination = {
            pageNumber: 1,
            pageSize: 10
        };

        var navigationObj = DecisionsConstant.NAVIGATON_STATES;

        init();

        function init() {
            console.log('Home controller');

            vm.navigation = navigationObj;

            var data = checkStateParams($stateParams);
            getDecisions(data);

            if (!$stateParams.tab) {
                vm.activeTab = 1;
            }
        }


        function getDecisions(data) {
            vm.decisionsSpinner = true;
            var pagination = _.clone(vm.pagination);
            pagination.pageNumber = pagination.pageNumber - 1;

            DecisionDataService.getDecisions(pagination).then(function(result) {
                vm.decisionsList = result.decisions;
                initPagination(result.totalDecisions);
                vm.decisionsSpinner = false;
            }, function(error) {
                console.log(error);
            });
        }

        function checkStateParams(stateParams) {
            if (!stateParams) return;
            var data,
                allowedTabParams;

            data = vm.pagination;
            allowedTabParams = navigationObj;

            data.sortDirection = stateParams.sortDirection || 'DESC';
            if (stateParams.tab) {
                var checkObj, allowed;

                checkObj = {
                    key: stateParams.tab
                };
                allowed = _.find(allowedTabParams, checkObj);
                if (_.isObject(allowed)) {
                    data.sort = allowed.value;
                } else {
                    $state.go($state.current.name, {
                        tab: null
                    }, {
                        reload: false,
                        notify: false
                    });
                }
            }
            return data;
        }

        function initPagination(total) {
            vm.pagination.totalDecisions = total || 10;
        }

        function search() {
            vm.showTrigger = true;
        }        

    }
})();