(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('DecisionsWrapperController', DecisionsWrapperController)
        .component('decisionsWrapper', {
            templateUrl: 'app/components/decisionsWrapper/decisions-wrapper.html',
            bindings: {
                decision: '<',
                title: '<',
                onChangeTab: '&'
            },
            controller: 'DecisionsWrapperController',
            controllerAs: 'vm',
        });


    DecisionsWrapperController.$inject = ['$rootScope', 'DecisionDataService', 'DecisionsConstant',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', 'DecisionsUtils'
    ];

    function DecisionsWrapperController($rootScope, DecisionDataService, DecisionsConstant,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, DecisionsUtils) {
        var vm = this;

        vm.$onInit = onInit;

        var criteriaGroupsIds = []; // Change every time

        var navigationObj = angular.copy(DecisionsConstant.NAVIGATON_STATES);
        navigationObj.unshift(DecisionsConstant.NAVIGATON_STATES_TOP_RATED);

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            vm.navigation = navigationObj;
            initPagination();

            // Use for deteck links
            if ($state.current.name === 'decisions.single.categories') {
                vm.isDecisionCategory = true;
                changeDecisionGroupsTabOnly($stateParams.categorySlug);
            } else {
                vm.isDecisionCategory = false;
                changeDecisionGroupsTabOnly($stateParams.category);
            }

            changeSortMode($stateParams.sort);

            // Call only on init
            getDecisionParents(vm.decision);

            if (vm.title === false) {
                vm.showTitle = false;
            } else {
                vm.showTitle = true;
            }
            vm.pagination = initPagination(10, $stateParams.page, $stateParams.size);
        }

        vm.changeDecisionGroupsTab = changeDecisionGroupsTab;

        function changeDecisionGroupsTab(mode) {
            changeDecisionGroupsTabOnly(mode);
            changeSortMode($stateParams.sort);
            sortModeRequest();
            vm.filterSearch = false;
            vm.onChangeTab({
                tab: vm.decisionGroupActive
            });
        }

        function changeDecisionGroupsTabOnly(mode) {
            var findIndex = _.findIndex(vm.decision.decisionGroups, function(navItem) {
                return navItem.nameSlug === mode;
            });
            if (findIndex >= 0) {
                vm.decisionGroupActive = vm.decision.decisionGroups[findIndex];
            } else if (vm.decision.decisionGroups && vm.decision.decisionGroups.length) {
                vm.decisionGroupActive = vm.decision.decisionGroups[0];
            }

            var sendDecisionGroupActive = mode ? vm.decisionGroupActive : null;
            vm.onChangeTab({
                tab: sendDecisionGroupActive
            });
        }

        // TODO: Simplify logic
        function changeSortMode(mode) {
            if (vm.decisionGroupActive && vm.decisionGroupActive.id) {
                var findIndex = _.findIndex(navigationObj, function(navItem) {
                    return navItem.key === mode;
                });

                if (findIndex >= 0 && !_.isNull(mode)) {
                    vm.tabMode = navigationObj[findIndex].value;
                    vm.activeTabSort = findIndex;
                    // Hide criterias
                    vm.criteriaGroups = [];

                    vm.urlRss = 'http://decisionwanted.com/api/v1.0/decisiongroups/' + vm.decisionGroupActive.id + '/rss' + (navigationObj[findIndex].value ? '?sort=' + navigationObj[findIndex].value : '?sort=topRated');
                } else {
                    vm.tabMode = 'topRated';
                    vm.activeTabSort = 0;

                    var params = $state.params;
                    params.sort = null;
                    $state.transitionTo($state.current.name, params, {
                        reload: false,
                        inherit: true,
                        notify: true
                    });
                    vm.urlRss = 'http://decisionwanted.com/api/v1.0/decisiongroups/' + vm.decisionGroupActive.id + '/rss';
                }
            }
        }

        function sortModeRequest() {
            // Don't call matrix
            if (vm.decisionGroupActive && vm.decisionGroupActive.totalChildDecisions === 0) {
                vm.decisions = [];
                return;
            }

            // null equals 'topRated';
            // console.log(vm.decisionGroupActive);
            if (_.isNull(vm.tabMode) || vm.tabMode === 'topRated') {
                if (vm.decisionGroupActive.inheritedDecisionGroupId) {
                    var inheritedDecisionGroupId = vm.decisionGroupActive.inheritedDecisionGroupId;
                    getCriteriaGroupsByParentId(inheritedDecisionGroupId).then(function(resp) {
                        var additionalDecisionGroupId = vm.decisionGroupActive.id;
                        var preparedCriteriaGroups = prepareCriteriaGroups(resp);
                        vm.criteriaGroups = preparedCriteriaGroups[0];
                        getDecisionMatrix(inheritedDecisionGroupId, null, false, additionalDecisionGroupId, preparedCriteriaGroups[1]).then(function() {
                            vm.criteriaGroupsLoader = false;
                        });
                    });

                    // vm.inheritedDecisionGroup
                    DecisionDataService.getDecisionGroups(inheritedDecisionGroupId).then(function(inheritedDecisionGroupResp) {
                        vm.inheritedDecisionGroup = inheritedDecisionGroupResp;
                    });

                } else {
                    getCriteriaGroupsByParentId(vm.decisionGroupActive.id).then(function(resp) {
                        var preparedCriteriaGroups = prepareCriteriaGroups(resp);
                        vm.criteriaGroups = preparedCriteriaGroups[0];
                        getDecisionMatrix(vm.decisionGroupActive.id, null, false, false, preparedCriteriaGroups[1]).then(function() {
                            vm.criteriaGroupsLoader = false;
                        });
                    });
                }
            } else if(vm.decisionGroupActive) {
                getDecisionMatrix(vm.decisionGroupActive.id);
            }
        }

        function getDecisionParents(decision) {
            vm.decisionsChildsLoader = true;
            vm.decisionParents = decision.parentDecisions;

            // decisionGroups
            vm.parentDecisionGroups = decision.parentDecisionGroups;
            // TODO: check if we need this code
            if (vm.decision.decisionGroups) {
                vm.decisionsChildsLoader = true;
                vm.activeDecisionGroupsTab = {
                    id: vm.decisionGroupActive.id,
                    name: vm.decisionGroupActive.name,
                    nameSlug: vm.decisionGroupActive.nameSlug
                };
            }

            vm.parentDecisionGroupsTabs = decision.parentDecisionGroups;
            if (vm.parentDecisionGroups && vm.parentDecisionGroups.length) {
                // getRecommendedDecisions(vm.decision.id, vm.parentDecisionGroups[0]);
                sortModeRequest();
                vm.activeParentTab = vm.parentDecisionGroups[0];
                vm.activeChildTab = vm.activeParentTab.ownerDecision.decisionGroups[0];
            } else if (vm.decisionGroupActive) {
                sortModeRequest();
            }

            if (vm.decisionGroupActive && vm.decisionGroupActive.totalChildDecisions === 0) {
                vm.decisions = [];
                vm.decisionsChildsLoader = false;
                return;
            }
        }

        function getDecisionMatrix(id, pagination, filter, additionalDecisionGroupId, criteriaGroupsIdsMatrix) {
            vm.decisionsChildsLoaderRequest = true;
            var sendData = {
                sortDecisionPropertyName: 'createDate',
                sortDecisionPropertyDirection: 'DESC',
                includeCharacteristicIds: [-1]
            };

            if (additionalDecisionGroupId) {
                sendData.additionalDecisionGroupId = additionalDecisionGroupId;
            }

            if (!pagination) {
                pagination = _.clone(vm.pagination);

                // Send page only if pagination exist
                // Don't call in when page without params
                if (pagination.pageNumber - 1 > 0) {
                    sendData.pageNumber = pagination.pageNumber - 1;
                    sendData.pageSize = pagination.pageSize;
                }
            } else {
                sendData.pageNumber = pagination.pageNumber - 1;
                sendData.pageSize = pagination.pageSize;
            }

            // console.log(criteriaGroupsIds);
            if (vm.tabMode === 'topRated' || _.isNull(vm.tabMode)) {
                sendData.sortCriteriaIds = _.isArray(criteriaGroupsIdsMatrix) ? criteriaGroupsIdsMatrix : criteriaGroupsIds; //Init in header
                sendData.sortWeightCriteriaDirection = 'DESC';
                sendData.sortTotalVotesCriteriaDirection = 'DESC';
            } else {
                sendData.sortDecisionPropertyName = vm.tabMode;
                sendData.sortDecisionPropertyDirection = 'DESC';
            }

            if (_.isNull(filter) || filter) {
                sendData.decisionNameFilterPattern = filter;
            } else if (vm.filterName) {
                sendData.decisionNameFilterPattern = vm.filterName;
            }

            return DecisionDataService.getDecisionMatrix(id, sendData).then(function(result) {
                vm.decisions = angular.copy(filterDecisionList(result.decisionMatrixs));
                vm.decisionsChildsLoader = false;
                vm.decisionsChildsLoaderRequest = false;

                vm.pagination = initPagination(result.totalDecisionMatrixs, $stateParams.page, $stateParams.size);
                vm.pagination.totalDecisions = result.totalDecisionMatrixs;
                checkScrollToDecision($stateParams.decisionId);
            });
        }

        function getCriteriaGroupsByParentId(id) {
            return DecisionDataService.getCriteriaGroupsById(id);
        }

        function prepareCriteriaGroups(result) {
            criteriaGroupsIds = [];
            result = _.filter(result, function(group) {
                return group.criteria.length > 0;
            });
            _.each(result, function(resultEl) {
                DecisionsUtils.prepareDecisionToUI(resultEl.criteria);
                _.each(resultEl.criteria, function(criteria) {
                    criteriaGroupsIds.push(criteria.id);
                });
            });

            return [DecisionsUtils.prepareDecisionToUI(result), criteriaGroupsIds];
        }

        vm.changeFilter = changeFilter;

        function changeFilter(value) {
            getDecisionMatrix(vm.decisionGroupActive.id, null, value);
            vm.filterSearch = true;
        }

        function filterDecisionList(decisionMatrixs) {
            var list = [];
            _.forEach(decisionMatrixs, function(item) {
                item.decision.criteria = item.criteria;
                list.push(item.decision);
            });
            return angular.copy(list);
        }

        // Change tab by click without reload page
        vm.changeOptionTab = changeOptionTab;

        function changeOptionTab(key) {
            changeSortMode(key);
            sortModeRequest();
        }

        // Pagination
        vm.changePage = changePage;

        function changePage(pagination) {
            getDecisionMatrix(vm.decisionGroupActive.id, pagination);
            updateStateParams(pagination);
        }

        function updateStateParams(pagination) {
            var params = $state.params;
            params.page = pagination.pageNumber || 1;
            params.size = pagination.pageSize;
            $state.transitionTo($state.current.name, params, {
                reload: false,
                inherit: true,
                notify: true
            });
        }

        function initPagination(total, pageNumber, pageSize) {
            if (pageSize) {
                vm.decisionsHeight = pageSize * 70 + 'px';
            }
            return {
                pageNumber: parseInt(pageNumber) || 1,
                pageSize: parseInt(pageSize) || 10,
                totalDecisions: parseInt(total) || 10
            };
        }
        // End pagination


        function checkScrollToDecision(id) {
            if (id) {
                vm.scrollToId = id;
            }
        }

    }
})();