(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionCategoriesController', DecisionCategoriesController);

    DecisionCategoriesController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', 'DecisionsConstant',
        '$stateParams', 'DecisionSharedService', '$state', 'DecisionsUtils', '$q', 'ContentFormaterService',
        'Config', 'PaginatioService'
    ];

    function DecisionCategoriesController($rootScope, decisionBasicInfo, DecisionDataService, DecisionsConstant,
        $stateParams, DecisionSharedService, $state, DecisionsUtils, $q, ContentFormaterService,
        Config, PaginatioService) {

        // TODO: clean up controller
        var vm = this;

        vm.decision = decisionBasicInfo || {};
        vm.itemsPerPage = PaginatioService.itemsPerPage();
        vm.$onInit = onInit;
        var scrolled = false;

        var criteriaGroupsIds = [];
        var navigationObj = angular.copy(DecisionsConstant.NAVIGATON_STATES);
        var newState = {
            key: 'topRated',
            value: null,
            label: 'Top Rated'
        };

        navigationObj.unshift(newState);

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            vm.decisionsLoader = true;
            vm.activeTabSortChild = 0;
            vm.navigation = navigationObj;
            vm.decisionParents = vm.decision.parentDecisions;
            initSortMode($stateParams.sort);

            if (vm.decision.decisionGroups.length) {
                vm.decisionsChildsLoader = true;
            } else {
                vm.decisionsLoader = false;
            }

            initTabs();
            setPageData();

            // // Init first time slugs
            // if (!$stateParams.categorySlug) {
            //     var params = $state.params;
            //     params.categorySlug = vm.decision.decisionGroups[0].nameSlug;
            //     $state.go($state.current.name, params ,{
            //         reload: false,
            //         notify: false
            //     });
            // }


        }

        function initTabs() {
            if (vm.decision.decisionGroups.length) {
                var index = _.findIndex(vm.decision.decisionGroups, function(decisionGroup) {
                    return decisionGroup.nameSlug === $stateParams.categorySlug;
                });
                if (index >= 0) {
                    vm.activeDecisionGroupsTabIndex = index;
                    vm.activeDecisionGroupsTab = vm.decision.decisionGroups[index];
                }
            }

            if (!$stateParams.categorySlug) {
                vm.activeDecisionGroupsTabIndex = 0;
                vm.activeDecisionGroupsTab = vm.decision.decisionGroups[0];
            }
        }

        // TODO: Simplify logic
        function initSortMode(mode) {
            var findIndex = _.findIndex(navigationObj, function(navItem) {
                return navItem.key === mode;
            });
            if (findIndex >= 0 && navigationObj[findIndex].key !== 'topRated') {
                vm.tabMode = navigationObj[findIndex].value;
                getDecisionMatrix(vm.decision.id);
                vm.activeTabSort = findIndex;
                // Hide criterias
                vm.criteriaGroups = [];
            } else {
                vm.tabMode = 'topRated';
                getCriteriaGroupsByParentId(vm.decision.id).then(function() {
                    getDecisionMatrix(vm.decision.id);
                });
                vm.activeTabSort = 0;
                // $state.params.sort = null;
                $state.transitionTo($state.current.name, $state.params, {
                    reload: false,
                    inherit: true,
                    notify: false
                });
            }
        }

        function setPageData() {
            $rootScope.pageTitle = vm.decision.name + ' Options | DecisionWanted.com';

            $rootScope.breadcrumbs = [{
                title: 'Decisions',
                link: 'decisions'
            }, {
                title: vm.decision.name,
                link: 'decisions.single'
            }, {
                title: 'Options',
                link: null
            }];
        }


        function getDecisionMatrix(id, pagination, filter) {
            var sendData = {};

            if (!vm.pagination) {
                vm.pagination = initPagination(null, $stateParams.page, $stateParams.size);
            }
            if (!pagination) {
                pagination = _.clone(vm.pagination);
            }
            sendData.pageNumber = pagination.pageNumber - 1;
            sendData.pageSize = pagination.pageSize;

            sendData.sortDecisionPropertyName = 'createDate';
            sendData.sortDecisionPropertyDirection = 'DESC';
            if (vm.tabMode === 'topRated') {
                sendData.sortCriteriaIds = criteriaGroupsIds;
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

            sendData.includeCharacteristicIds = [-1];
            DecisionDataService.getDecisionMatrix(id, sendData).then(function(result) {
                vm.decisions = [];
                vm.decisions = filterDecisionList(result.decisionMatrixs);
                vm.decisionsLoader = false;

                vm.pagination = initPagination(result.totalDecisionMatrixs, $stateParams.page, $stateParams.size);
                vm.decisionsHeight = vm.pagination.pageSize * 70 + 'px';
                vm.totalCount = result.totalDecisionMatrixs;

                scrollToDecision($stateParams.decisionId);
                vm.decisionsChildsLoader = false;
            });
        }


        // Pagination
        vm.changePage = changePage;

        function changePage(pagination) {
            getDecisionMatrix(vm.decision.id, pagination);
            updateStateParams(pagination);

            var params = $stateParams;
            params.decisionId = null;
            $state.go($state.current.name, params, {
                notify: false,
                reload: false
            });
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

        function initPagination(total, pageNumber, pageSize) {
            return {
                pageNumber: parseInt(pageNumber) || 1,
                pageSize: parseInt(pageSize) || 10,
                totalDecisions: parseInt(total) || 10
            };
        }
        // End pagination

        function getCriteriaGroupsByParentId(id) {
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(id).then(function(result) {
                result = _.filter(result, function(group) {
                    if (group.criteria.length > 0) return group;
                });
                vm.criteriaGroups = DecisionsUtils.prepareDecisionToUI(result);
                _.forEach(result, function(resultEl) {
                    DecisionsUtils.prepareDecisionToUI(resultEl.criteria);

                    _.forEach(resultEl.criteria, function(criteria) {
                        criteriaGroupsIds.push(criteria.id);
                    });
                });

                return result;
            });
        }

        vm.changeFilter = changeFilter;

        function changeFilter(value) {
            getDecisionMatrix(vm.decision.id, null, value);
        }

        function filterDecisionList(decisionMatrixs) {
            var list = [];
            _.forEach(decisionMatrixs, function(item) {
                item.decision.criteria = item.criteria;
                list.push(item.decision);
            });
            return list;
        }

        // Change tab by click without reload page
        vm.changeOptionTab = changeOptionTab;

        function changeOptionTab(key) {
            initSortMode(key);
            vm.decisionsChildsLoader = true;
        }

        function scrollToDecision(id) {
            if (scrolled !== true && !!id && id >= 0) {
                // TODO: avoid set Timeout
                // Move to decision list component
                setTimeout(function() {

                    var decision = $('#decision-' + id);
                    decision.addClass('animate-highlight');
                    $('html, body').animate({
                        scrollTop: decision.offset().top - 100
                    }, 350);


                }, 0);
            }
            scrolled = true;
        }

    }
})();