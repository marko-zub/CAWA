(function() {
    // TODO: clean up remove repeated code
    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionSingleController', DecisionSingleController);

    DecisionSingleController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', 'DecisionsConstant',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', 'DecisionsUtils', '$q', 'ContentFormaterService',
        'Config', '$sce'
    ];

    function DecisionSingleController($rootScope, decisionBasicInfo, DecisionDataService, DecisionsConstant,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, DecisionsUtils, $q, ContentFormaterService,
        Config, $sce) {

        var vm = this;

        vm.decision = DecisionsUtils.prepareDecisionSingleToUI(decisionBasicInfo, false) || {};
        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;
        vm.$onInit = onInit;

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
            vm.activeTabSortChild = 0;

            console.log('Decision Single Controller');
            vm.navigation = navigationObj;
            initPagination();
            getDecisionParents(vm.decision);

            $rootScope.pageTitle = vm.decision.name + ' | ' + Config.pagePrefix;

            var mediaLogo = _.find(vm.decision.medias, function(media) {
                return media.type === 'LOGO';
            });

            if (mediaLogo) vm.decision.imageUrl = mediaLogo.url;

            $rootScope.breadcrumbs = [{
                title: 'Decisions',
                link: 'decisions'
            }, {
                title: vm.decision.name,
                link: null
            }];

            changeDecisionGroupsTab($stateParams.category);
            initSortMode($stateParams.sort);

            vm.decision.description = $sce.trustAsHtml(_.unescape(vm.decision.description));

            if (!$state.params.sort) {
                vm.activeDecisionGroupsTabIndex = 0;
            }

            vm.criteriaGroupsLoader = true;
            vm.characteristicGroupsLoader = true;

            setImageSize();
        }

        function setImageSize() {
            // Set only for svg
            angular.element(document).ready(function () {
                if (vm.decision.imageStyle) {
                    var img = $('.post-image img');
                    if (img) {
                        img.css({
                            height: (img[0].naturalHeight > 0 && img[0].naturalHeight < 180) ? img[0].naturalHeight + 'px' : '180px',
                            width: (img[0].naturalWidth > 0 && img[0].naturalWidth < 180) ? img[0].naturalWidth + 'px' : '180px'
                        });
                    }
                }

            });
        }

        vm.changeDecisionGroupsTab = changeDecisionGroupsTab;
        var decisionGroupActiveId;

        function changeDecisionGroupsTab(mode) {
            // console.log(vm.decisionGroups);

            var findIndex = _.findIndex(vm.decisionGroups, function(navItem) {
                return navItem.nameSlug === mode;
            });
            if (findIndex >= 0) {
                vm.activeDecisionGroupsTabIndex = findIndex;
                vm.decisionGroupActive = vm.decision.decisionGroups[vm.activeDecisionGroupsTabIndex];
                decisionGroupActiveId = vm.decisionGroupActive.id;
            } else if (vm.decision.decisionGroups) {
                vm.decisionGroupActive = vm.decision.decisionGroups[0];
                decisionGroupActiveId = vm.decisionGroupActive.id;
            }
        }

        // TODO: Simplify logic
        function initSortMode(mode) {
            if (decisionGroupActiveId) {
                var findIndex = _.findIndex(navigationObj, function(navItem) {
                    return navItem.key === mode;
                });
                if (findIndex >= 0 && navigationObj[findIndex].key !== 'topRated') {
                    vm.tabMode = navigationObj[findIndex].value;
                    getDecisionMatrix(decisionGroupActiveId);
                    vm.activeTabSort = findIndex;
                    // Hide criterias
                    vm.criteriaGroups = [];
                } else {
                    vm.tabMode = 'topRated';
                    getCriteriaGroupsByParentId(vm.decision.id).then(function() {
                        getDecisionMatrix(decisionGroupActiveId).then(function() {
                            vm.criteriaGroupsLoader = false;
                        });
                    });
                    vm.activeTabSort = 0;
                    $state.params.sort = null;
                    $state.transitionTo($state.current.name, $state.params, {
                        reload: false,
                        inherit: true,
                        notify: false
                    });
                }
            }
        }

        function getDecisionParents(decision) {
            vm.decisionsChildsLoader = true;
            vm.decisionParents = decision.parentDecisions;

            if (vm.decision.totalChildDecisions > 0) {
                vm.isDecisionsParent = true;
                initSortMode($stateParams.sort);
            }

            // decisionGroups
            vm.parentDecisionGroups = decision.parentDecisionGroups;
            vm.decisionGroups = decision.decisionGroups;

            vm.parentDecisionGroupsTabs = decision.parentDecisionGroups;
            if (vm.decisionGroups) {
                vm.decisionsChildsLoader = true;
                vm.activeDecisionGroupsTab = {
                    id: vm.decisionGroups[0].id,
                    name: vm.decisionGroups[0].name,
                    nameSlug: vm.decisionGroups[0].nameSlug
                };

                var sendData = {};
                sendData.includeCharacteristicIds = [-1];
                // sendData.sortDecisionPropertyName = vm.tabMode;
                sendData.sortDecisionPropertyDirection = 'DESC';
                DecisionDataService.getDecisionGroups(vm.decisionGroups[0].id, sendData).then(function(result) {
                    // console.log(result)
                    var childDecisionGroups = [];
                    vm.childDecisionGroups = _.filter(result.decisionMatrixs, function(decision) {
                        childDecisionGroups.push(decision.decision);
                    });

                    vm.childDecisionGroups = childDecisionGroups;
                    vm.decisionsChildsLoader = false;
                });
            }

            if (vm.parentDecisionGroups && vm.parentDecisionGroups.length) {
                // getRecommendedDecisions(vm.decision.id, vm.parentDecisionGroups[0]);
                getParentDecisionGroupsCriteriaCharacteristicts(vm.parentDecisionGroups[0].id);
                vm.activeParentTab = vm.parentDecisionGroups[0];
                vm.activeParentTab.index = 0;
                // vm.activeParentTab = {
                //     index: 0,
                //     name: vm.parentDecisionGroups[0].name,
                // };
            } else {
                // getRecommendedDecisions(vm.decision.id, vm.decision);
            }
        }

        function getDecisionMatrix(id, pagination, filter) {
            vm.decisionsChildsLoaderRequest = true;
            var sendData = {};

            if (!pagination) {
                pagination = _.clone(vm.pagination);
            } else {
                sendData.pageNumber = pagination.pageNumber - 1;
                sendData.pageSize = pagination.pageSize;
            }


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
            return DecisionDataService.getDecisionMatrix(id, sendData).then(function(result) {
                vm.decisions = [];
                vm.decisions = filterDecisionList(result.decisionMatrixs);
                vm.decisionsChildsLoader = false;
                vm.decisionsChildsLoaderRequest = false;

                vm.pagination = initPagination(result.totalDecisionMatrixs, $stateParams.page, $stateParams.size);
                vm.pagination.totalDecisions = result.totalDecisionMatrixs;
            });
        }

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
            getDecisionMatrix(decisionGroupActiveId, null, value);
        }

        // TODO: move to login to recommended component
        // Recommended decisions
        vm.getRecommendedDecisions = getRecommendedDecisions;

        function getRecommendedDecisions(decisionId, parent) {
            if (!parent) return;
            var sendData = {
                includeCharacteristicIds: [-1]
            };
            sendData.excludeChildDecisionIds = [decisionId];

            vm.activeRecommendedTab = {
                id: parent.id,
                name: parent.name,
                nameSlug: parent.nameSlug
            };

            DecisionDataService.getCriteriaGroupsById(parent.id).then(function(resultCriteria) {
                sendData.sortCriteriaIds = pickCriteriaIds(resultCriteria);
                vm.criteriaGroups = DecisionsUtils.prepareDecisionToUI(resultCriteria);
                DecisionDataService.getDecisionMatrix(parent.id, sendData).then(function(resultDecisions) {
                    vm.recommendedDecisionsList = filterDecisionList(resultDecisions.decisionMatrixs);
                    vm.recommendedDecisionsListLoader = false;
                    vm.activeRecommendedTab.total = resultDecisions.totalDecisionMatrixs;
                });
            });
        }

        // TODO: move to service
        function pickCriteriaIds(result) {
            var criteriaGroupsIdsArray = [];
            _.forEach(result, function(resultEl) {
                _.forEach(resultEl.criteria, function(criteria) {
                    criteriaGroupsIdsArray.push(criteria.id);
                });
            });
            return criteriaGroupsIdsArray;
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
        }

        // Pagination
        vm.changePage = changePage;

        function changePage(pagination) {
            getDecisionMatrix(decisionGroupActiveId, pagination);
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


        // TODO: simplify right block
        // Remove second criteria call
        function getCharacteristicsGroupsById(id) {
            return DecisionDataService.getCharacteristicsGroupsById(id, {
                options: false
            }).then(function(result) {
                return result;
            });
        }

        function mergeCharacteristicsDecisions(decisions, characteristicsArray) {
            var currentDecisionCharacteristics = decisions.decisionMatrixs[0].characteristics;
            return _.filter(characteristicsArray, function(resultEl) {
                _.map(resultEl.characteristics, function(el) {
                    el.description = $sce.trustAsHtml(el.description);

                    var elEqual = _.find(currentDecisionCharacteristics, {
                        id: el.id
                    });

                    if (elEqual) {
                        el.decision = elEqual;
                        return el;
                    }
                });
                if (resultEl.characteristics.length > 0) return resultEl;
            });
        }

        function getParentDecisionGroupsCriteriaCharacteristicts(parentId) {
            var sendData = {
                includeChildDecisionIds: []
            };
            sendData.includeChildDecisionIds.push(vm.decision.id);
            // console.log(parentId)
            $q.all([
                getCriteriaGroupsByParentId(parentId),
                getCharacteristicsGroupsById(parentId),
            ]).then(function(values) {
                var characteristicGroups = _.filter(values[1], function(resultEl) {
                    resultEl.characteristics = _.sortBy(resultEl.characteristics, 'createDate');
                    _.map(resultEl.characteristics, function(el) {
                        return el;
                    });
                    if (resultEl.characteristics.length > 0) return resultEl;
                });

                // Criterias IDs
                sendData.sortCriteriaIds = criteriaGroupsIds;

                var params = {
                    sortCriteriaIds: criteriaGroupsIds,
                    sortDecisionPropertyName: 'createDate',
                    sortDecisionPropertyDirection: 'DESC',
                    sortWeightCriteriaDirection: 'DESC',
                    sortTotalVotesCriteriaDirection: 'DESC'
                };
                getCriteriaByDecisionIndex(vm.decision.id, parentId, params);

                DecisionDataService.getDecisionMatrix(parentId, sendData).then(function(resp) {
                    var criteriaGroups = DecisionsUtils.mergeCriteriaDecision(resp.decisionMatrixs[0].criteria, values[0]);
                    criteriaGroups.totalVotes = _.sumBy(criteriaGroups, function(group) {
                        return _.sumBy(group.criteria, 'totalVotes');
                    });
                    vm.criteriaGroupsCompilance = criteriaGroups;
                    vm.criteriaGroupsLoader = false;

                    vm.characteristicGroups = mergeCharacteristicsDecisions(resp, characteristicGroups);
                    var decisionMatrixs = resp.decisionMatrixs;
                    vm.decision.criteriaCompliancePercentage = _.floor(decisionMatrixs[0].decision.criteriaCompliancePercentage, 2).toFixed(2);
                    vm.characteristicGroupsLoader = false;
                });
            });
        }

        // Move to component
        function getCriteriaByDecisionIndex(decisionId, parentDecisionId, params) {
            DecisionDataService.getCriteriaByDecisionIndex(decisionId, parentDecisionId, params).then(function(resp) {
                if (_.isNumber(resp.number)) {
                    vm.decisionIndexInParentGroup = resp.number + 1;
                    vm.decisionIndexInParentGroupPage = _.floor(resp.number / 10) + 1;
                }
            });
        }
    }
})();