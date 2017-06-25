(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionsController', DecisionsController);

    DecisionsController.$inject = ['DecisionDataService', '$sce', '$rootScope', '$state', '$stateParams', 'PaginatorConstant', 'DecisionsConstant', 'DecisionsService'];

    function DecisionsController(DecisionDataService, $sce, $rootScope, $state, $stateParams, PaginatorConstant, DecisionsConstant, DecisionsService) {
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

        init();

        function init() {
            console.log('Decisions controller');

            vm.navigation = navigationObj;

            $rootScope.pageTitle = 'Decisions' + ' | DecisionWanted';
            var data = checkStateParams($stateParams);
            getDecisions(data);

            getTotalDecisions();

            vm.totalCount = decisionsData.totalDecisions;

            if (!$stateParams.tab) {
                vm.activeTab = 1;
            }
        }

        var decisionsHeight = 97;
        vm.decisionsHeight = vm.pagination.pageSize * decisionsHeight + 'px';

        function getDecisions(data) {
            vm.decisionsSpinner = true;
            var pagination = _.clone(vm.pagination);
            pagination.pageNumber = pagination.pageNumber - 1;

            DecisionDataService.getDecisions(pagination).then(function(result) {
                vm.decisionsList = descriptionTrustHtml(result.decisions);
                initPagination(result.totalDecisions);

                // TODO: avoid height
                vm.decisionsHeight = result.decisions.length * decisionsHeight + 'px';
                vm.decisionsSpinner = false;
            }, function(error) {
                console.log(error);
            });
        }

        // Move to Utils
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                if (!el.imageUrl) el.imageUrl = '/images/noimage.jpg';

                // Move to constat
                if (el.description && el.description.length > 80) {
                    el.description = el.description.substring(0, 80) + '...';
                }

                el.description = $sce.trustAsHtml(el.description);

                return el;
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
            $state.go($state.current.name, {
                page: vm.pagination.pageNumber,
                size: vm.pagination.pageSize
            }, {
                notify: false,
                reload: false,
                location: false
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
                if(vm.totalCount !== resp.totalCount) {
                    vm.totalCount = resp.totalCount;
                    DecisionsService.setCount(vm.totalCount);
                }
                
            });
        }
    }
})();