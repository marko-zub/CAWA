(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionsController', DecisionsController);

    DecisionsController.$inject = ['DecisionDataService', '$rootScope', '$state', '$stateParams', 'DecisionsConstant', 'DecisionsService', 'translateFilter', '$localStorage', 'PaginatioService'];

    function DecisionsController(DecisionDataService, $rootScope, $state, $stateParams, DecisionsConstant, DecisionsService, translateFilter, $localStorage, PaginatioService) {
        var vm = this;
        vm.itemsPerPage = PaginatioService.itemsPerPage();

        var navigationObj = DecisionsConstant.NAVIGATON_STATES;
        var decisionsData = DecisionsService.getData();

        vm.$onInit = onInit;

        function onInit() {
            vm.navigation = navigationObj;
            $rootScope.pageTitle = translateFilter('Decisions') + ' | DecisionWanted.com';
            var data = getStateParams($stateParams);
            getDecisions(data);
            getTotalDecisions();
            vm.totalCount = decisionsData.totalDecisions;

            if (!$stateParams.sort) {
                vm.activeTab = 1;
            }

            if ($localStorage.options && !_.isEmpty($localStorage.options.view)) {
               var layoutMode = $localStorage.options.view.layoutMode || 'list';
               toggleLayout(layoutMode);
            }
        }

        function getDecisions(data) {
            vm.decisionsLoader = true;

            var sendData = getStateParams($stateParams);
            sendData.pageNumber = data.pageNumber - 1;

            DecisionDataService.getDecisions(sendData).then(function(result) {
                vm.decisionsList = result.decisions;
                vm.pagination = PaginatioService.initPagination(result.totalDecisions, $stateParams.page, $stateParams.size);
                vm.decisionsLoader = false;
            }, function(error) {
                console.log(error);
            });
        }

        // TODO: make service
        // Pagination
        vm.changePage = changePage;

        function changePage(pagination) {
            getDecisions(pagination); // TODO: make as callback
            updateStateParams(pagination);
        }

        function updateStateParams(pagination) {
            var params = $state.params;
            params.page = pagination.pageNumber || 1;
            params.size = pagination.pageSize;
            $state.transitionTo($state.current.name, params, {
                reload: false,
                inherit: true,
                notify: false
            });
        }
        // End pagination

        function getStateParams(stateParams) {
            if (!stateParams) return;
            var data = {},
                allowedSortParams;

            data.pageNumber =  stateParams.page || 1;
            data.pageSize = stateParams.size || 10;

            allowedSortParams = navigationObj;

            data.sortDirection = stateParams.sortDirection || 'DESC';
            if (stateParams.sort) {
                var checkObj, allowed;

                checkObj = {
                    key: stateParams.sort
                };
                allowed = _.find(allowedSortParams, checkObj);
                if (_.isObject(allowed)) {
                    data.sort = allowed.value;

                    $rootScope.pageTitle = allowed.label + translateFilter('Decisions') + ' | DecisionWanted.com';
                } else {
                    $state.go($state.current.name, {
                        sort: null
                    }, {
                        reload: false,
                        notify: false
                    });
                }
            }
            return data;
        }

        function getTotalDecisions() {
            DecisionDataService.getDecisionsCount().then(function(resp) {
                if (vm.totalCount !== resp.number) {
                    vm.totalCount = resp.number;
                    DecisionsService.setCount(vm.totalCount);
                }
            });
        }

        // TODO: clean up
        vm.toggleLayout = toggleLayout;
        var allowedLayoutClass = ['list', 'cards'];

        function toggleLayout(type) {
            if (_.includes(allowedLayoutClass, type)) {
                vm.layoutClass = type;
                $localStorage.options.view = {
                    layoutMode: type
                };
            }
        }
    }
})();