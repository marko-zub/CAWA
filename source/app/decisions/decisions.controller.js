(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionsController', DecisionsController);

    DecisionsController.$inject = ['DecisionDataService', '$rootScope', '$state', '$stateParams', 'PaginatorConstant', 'DecisionsConstant', 'DecisionsService', 'translateFilter'];

    function DecisionsController(DecisionDataService, $rootScope, $state, $stateParams, PaginatorConstant, DecisionsConstant, DecisionsService, translateFilter) {
        var
            vm = this;

        vm.changePageSize = changePageSize;
        vm.changePage = changePage;
        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;

        vm.pagination = {
            pageNumber: parseInt($stateParams.page) || 1,
            pageSize: parseInt($stateParams.size) || 10
        };

        var navigationObj = DecisionsConstant.NAVIGATON_STATES;
        var decisionsData = DecisionsService.getData();

        vm.$onInit = onInit;

        function onInit() {
            console.log('Decisions controller');

            vm.navigation = navigationObj;

            $rootScope.pageTitle = translateFilter('Decisions') + ' | DecisionWanted.com';
            var data = checkStateParams($stateParams);
            getDecisions(data);

            getTotalDecisions();

            vm.totalCount = decisionsData.totalDecisions;

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
            // TODO: change page loop bug
            var params = $state.params;
            params.page = vm.pagination.pageNumber;
            params.size = vm.pagination.pageSize;
            $state.transitionTo($state.current.name, params, {
                reload: false,
                inherit: true,
                notify: false
            });
        }

        function checkStateParams(stateParams) {
            if (!stateParams) return;
            var data,
                allowedSortParams;

            data = vm.pagination;
            allowedSortParams = navigationObj;

            data.sortDirection = stateParams.sortDirection || 'DESC';
            if (stateParams.tab) {
                var checkObj, allowed;

                checkObj = {
                    key: stateParams.tab
                };
                allowed = _.find(allowedSortParams, checkObj);
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

        function getTotalDecisions() {
            DecisionDataService.getDecisionsCount().then(function(resp) {
                if (vm.totalCount !== resp.totalCount) {
                    vm.totalCount = resp.totalCount;
                    DecisionsService.setCount(vm.totalCount);
                }

            });
        }

        // TODO: clean up
        vm.layoutClass = 'list';
        vm.toggleLayout = toggleLayout;
        var allowedLayoutClass = ['list', 'cards'];

        function toggleLayout(type, $event) {
            if (_.includes(allowedLayoutClass, type)) vm.layoutClass = type;
        }
    }
})();