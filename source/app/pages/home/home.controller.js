(function() {

    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['DecisionDataService', '$rootScope', '$state', '$stateParams', 'PaginatorConstant', 'DecisionsConstant', '$localStorage'];

    function HomeController(DecisionDataService, $rootScope, $state, $stateParams, PaginatorConstant, DecisionsConstant, $localStorage) {
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

        vm.$onInit = onInit;

        function onInit() {
            vm.navigation = navigationObj;
            var data = checkStateParams($stateParams);
            getDecisions(data);

            if (!$stateParams.sort) {
                vm.activeTab = 1;
            }

            if ($localStorage.options && !_.isEmpty($localStorage.options.view)) {
               var layoutMode = $localStorage.options.view.layoutMode;
               toggleLayout(layoutMode);
            }
        }


        function getDecisions() {
            vm.decisionsLoader = true;
            var pagination = _.clone(vm.pagination);
            pagination.pageNumber = pagination.pageNumber - 1;

            DecisionDataService.getDecisions(pagination).then(function(result) {
                vm.decisions = result.decisions;
                vm.decisionsLoader = false;
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
            if (stateParams.sort) {
                var checkObj, allowed;

                checkObj = {
                    key: stateParams.sort
                };
                allowed = _.find(allowedTabParams, checkObj);
                if (_.isObject(allowed)) {
                    // $rootScope.pageTitle = allowed.label + ' ' + 'Decision-Making Social Network' + ' | DecisionWanted.com';
                    data.sort = allowed.value;
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

        function search() {
            vm.showTrigger = true;
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