(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionsController', DecisionsController);

    DecisionsController.$inject = ['DecisionDataService', '$sce', '$rootScope', '$state', '$stateParams', 'PaginatorConstant'];

    function DecisionsController(DecisionDataService, $sce, $rootScope, $state, $stateParams, PaginatorConstant) {
        var
            vm = this;

        vm.changePageSize = changePageSize;
        vm.changePage = changePage;
        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;

        vm.pagination = {
            pageNumber: parseInt($stateParams.page) || 1,
            pageSize: parseInt($stateParams.size) || 10
        };

        init();

        function init() {
            console.log('Decisions controller');

            $rootScope.pageTitle = 'Decisions' + ' | DecisionWanted';
            data = checkStateParams($stateParams);
            getDecisions(data);
        }

        function getDecisions(data) {
            vm.decisionsSpinner = true;
            var pagination = _.clone(vm.pagination);
            pagination.pageNumber = pagination.pageNumber - 1;

            DecisionDataService.getDecisions(pagination).then(function(result) {
                vm.decisionsList = descriptionTrustHtml(result.decisions);
                initPagination(result.totalDecisions);
                vm.decisionsSpinner = false;
            }, function(error) {
                console.log(error);
            });
        }

        // Move to Utils
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                if (!el.imageUrl) el.imageUrl = '/images/noimage.png';
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
                location: 'replace'
            });
        }

        function checkStateParams(stateParams) {
            if (!stateParams) return;
            var data, allowedSortParams;
            data = vm.pagination;
            allowedSortParams = [{
                key: 'createDate',
                value: 'createDate'
            }, {
                key: 'updateDate',
                value: 'updateDate'
            }, {
                key: 'totalVotes',
                value: 'totalVotes'
            }];

            data.sortDirection = stateParams.sortDirection || 'DESC';
            if (stateParams.sort) {
                var checkObj, allowed;

                checkObj = {
                    key: stateParams.sort
                };
                allowed = _.find(allowedSortParams, checkObj);
                if (_.isObject(allowed)) {
                    data.sort = allowed.value;
                } else {
                    $state.go($state.current.name, {
                        sort: null,
                        location: 'replace'
                    });
                }
            }
            return data;
        }

        function initPagination(total) {
            vm.pagination.totalDecisions = total || 10;
        }
    }
})();