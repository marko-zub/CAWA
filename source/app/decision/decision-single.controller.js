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


        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;
        vm.$onInit = onInit;

        var navigationObj = angular.copy(DecisionsConstant.NAVIGATON_STATES);
        var newState = DecisionsConstant.NAVIGATON_STATES_TOP_RATED;
        navigationObj.unshift(newState);

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            // console.log('Decision Single Controller');
            vm.decision = prepareDecision(decisionBasicInfo);
            setPageData();

            vm.navigation = navigationObj;
            initPagination();

            vm.decisionGroupActive = findDecisionGroupsAvtive($stateParams.category, vm.decision);
            getDecisionParents(vm.decision);
            initSortMode($stateParams.sort);
            updateCharactCritData();
            setImageSize();
        }

        function prepareDecision(decision) {
            decision = DecisionsUtils.prepareDecisionSingleToUI(decision, true, false) || {};
            var mediaLogo = _.find(decision.medias, function(media) {
                return media.type === 'LOGO';
            });

            if (mediaLogo) decision.imageUrl = mediaLogo.url;
            return decision;
        }

        function setPageData() {
            $rootScope.breadcrumbs = [{
                title: 'Decisions',
                link: 'decisions'
            }, {
                title: vm.decision.name,
                link: null
            }];
            $rootScope.pageTitle = vm.decision.name + ' | ' + Config.pagePrefix;
        }

        function setImageSize() {
            // Set only for svg
            angular.element(document).ready(function() {
                if (vm.decision.imageStyle) {
                    var img = $('.post-image img');
                    if (img) {
                        var imgStyles = {
                            height: (img[0].naturalHeight > 0 && img[0].naturalHeight < 180) ? img[0].naturalHeight + 'px' : '180px',
                            width: (img[0].naturalWidth > 0 && img[0].naturalWidth < 180) ? img[0].naturalWidth + 'px' : '180px'
                        };
                        img.css(imgStyles);
                    }
                }
            });
        }

        vm.changeDecisionGroupsTab = changeDecisionGroupsTab;

        function changeDecisionGroupsTab(mode) {
            vm.decisionGroupActive = findDecisionGroupsAvtive(mode, vm.decision);
            updateCharactCritData();
        }

        function findDecisionGroupsAvtive(mode, decision) {
            var decisionGroupActive;
            var findIndex = _.findIndex(decision.decisionGroups, function(navItem) {
                return navItem.nameSlug === mode;
            });
            if (findIndex >= 0) {
                decisionGroupActive = decision.decisionGroups[findIndex];
            } else if (decision.decisionGroups && decision.decisionGroups.length) {
                decisionGroupActive = decision.decisionGroups[0];
            }

            return decisionGroupActive;
        }

        function getParentGroupsMatrixAdditionalRequest() {
            var inheritedDecisionGroupId = vm.decisionGroupActive.inheritedDecisionGroupId;
            if (inheritedDecisionGroupId && vm.decisionGroupActive) {
                getParentGroupsMatrix(vm.activeParentTab, false);
                getParentGroupsMatrixAdditional(inheritedDecisionGroupId, vm.decisionGroupActive.id);
            }
        }

        function updateCharactCritData() {
            // initSortMode($stateParams.sort);
            if (vm.decisionGroupActive.inheritedDecisionGroupId && vm.activeParentTab) {
                getParentGroupsMatrixAdditionalRequest();
            } else if (vm.activeParentTab) {
                getParentGroupsMatrix(vm.activeParentTab);
            }
        }

        // TODO: Simplify logic
        function initSortMode(mode) {
            if (vm.decisionGroupActive && vm.decisionGroupActive.id) {
                var findIndex = _.findIndex(navigationObj, function(navItem) {
                    return navItem.key === mode;
                });

                if (findIndex >= 0) {
                    vm.tabMode = navigationObj[findIndex].value;
                    // if (!vm.decisionGroupActive.inheritedDecisionGroupId) {
                    //     getDecisionMatrix(vm.decisionGroupActive.id);
                    // } else if (vm.activeParentTab && vm.decisionGroupActive.inheritedDecisionGroupId) {
                    //     getParentGroupsMatrixAdditionalRequest();
                    //     // console.log(vm.activeParentTab);
                    // }
                    vm.activeTabSort = findIndex;
                    // Hide criterias
                    vm.criteriaGroups = [];
                } else {
                    vm.tabMode = 'topRated';
                    // if (!vm.decisionGroupActive.inheritedDecisionGroupId) {
                    //     getCriteriaGroupsByParentId(vm.decision.id).then(function() {
                    //         getDecisionMatrix(vm.decisionGroupActive.id).then(function() {
                    //             vm.criteriaGroupsLoader = false;
                    //         });
                    //     });
                    // } else if (vm.activeParentTab && vm.decisionGroupActive.inheritedDecisionGroupId) {
                    //     getParentGroupsMatrixAdditionalRequest();
                    //     // console.log(vm.activeParentTab);
                    // }

                    vm.activeTabSort = 0;

                    var params = $state.params;
                    params.sort = null;
                    $state.transitionTo($state.current.name, params, {
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

            // decisionGroups
            vm.parentDecisionGroups = decision.parentDecisionGroups;
            vm.parentDecisionGroupsTabs = decision.parentDecisionGroups;

            if (vm.decision.decisionGroups) {
                vm.decisionsChildsLoader = true;
                vm.activeDecisionGroupsTab = {
                    id: vm.decisionGroupActive.id,
                    name: vm.decisionGroupActive.name,
                    nameSlug: vm.decisionGroupActive.nameSlug
                };

                var sendData = {};
                sendData.includeCharacteristicIds = [-1];
                sendData.sortDecisionPropertyDirection = 'DESC';
                DecisionDataService.getDecisionGroups(vm.decisionGroupActive.id, sendData).then(function(result) {
                    var childDecisionGroups = [];
                    vm.childDecisionGroups = _.filter(result.decisionMatrixs, function(decision) {
                        childDecisionGroups.push(decision.decision);
                    });

                    vm.childDecisionGroups = childDecisionGroups;
                    vm.decisionsChildsLoader = false;
                });
            }

            if (vm.parentDecisionGroups && vm.parentDecisionGroups.length) {
                vm.activeParentTab = vm.parentDecisionGroups[0];
                vm.activeChildTab = vm.activeParentTab.ownerDecision.decisionGroups[0];
            }
        }

        function getDecisionMatrix(id, pagination, filter, criteriaGroupsIds) {
            vm.decisionsChildsLoaderRequest = true;
            var sendData = {
                sortDecisionPropertyName: 'createDate',
                sortDecisionPropertyDirection: 'DESC',
                includeCharacteristicIds: [-1]
            };

            if (!pagination) {
                pagination = _.clone(vm.pagination);
            } else {
                sendData.pageNumber = pagination.pageNumber - 1;
                sendData.pageSize = pagination.pageSize;
            }

            if (vm.tabMode === 'topRated') {
                if (criteriaGroupsIds) {
                    sendData.sortCriteriaIds = criteriaGroupsIds; //Need ids
                }
                sendData.sortWeightCriteriaDirection = 'DESC';
                sendData.sortTotalVotesCriteriaDirection = 'DESC';
            } else {
                sendData.sortDecisionPropertyName = vm.tabMode;
                sendData.sortDecisionPropertyDirection = 'DESC';
            }

            if (vm.decisionGroupActive.inheritedDecisionGroupId) {
                sendData.additionalDecisionGroupId = vm.decisionGroupActive.inheritedDecisionGroupId;
                // id = inheritedDecisionGroupId;
            }

            // Filter
            if (_.isNull(filter) || filter) {
                sendData.decisionNameFilterPattern = filter;
            } else if (vm.filterName) {
                sendData.decisionNameFilterPattern = vm.filterName;
            }

            return DecisionDataService.getDecisionMatrix(id, sendData).then(function(result) {
                displayMatrixReps(result);
                vm.decisionsChildsLoader = false;
                vm.decisionsChildsLoaderRequest = false;
            });
        }

        function displayMatrixReps(result) {
            vm.decisions = filterDecisionList(result.decisionMatrixs);
            vm.pagination = initPagination(result.totalDecisionMatrixs, $stateParams.page, $stateParams.size);
            vm.pagination.totalDecisions = result.totalDecisionMatrixs;
        }

        function getCriteriaGroupsByParentId(id) {
            return DecisionDataService.getCriteriaGroupsById(id);
        }

        function prepareCriteriaGroups(result) {
            var criteriaGroupsIds = [];
            result = _.filter(result, function(group) {
                return group.criteria.length > 0;
            });
            _.each(result, function(resultEl) {
                DecisionsUtils.prepareDecisionToUI(resultEl.criteria);
                _.each(resultEl.criteria, function(criteria) {
                    criteriaGroupsIds.push(criteria.id);
                });
            });

            var res = DecisionsUtils.prepareDecisionToUI(result);

            return [res, criteriaGroupsIds];
        }

        vm.changeFilter = changeFilter;

        function changeFilter(value) {
            getDecisionMatrix(vm.decisionGroupActive.id, null, value);
        }

        // TODO: move to login to recommended component
        // Recommended decisions
        // vm.getRecommendedDecisions = getRecommendedDecisions;

        // function getRecommendedDecisions(decisionId, parent) {
        //     if (!parent) return;
        //     var sendData = {
        //         includeCharacteristicIds: [-1]
        //     };
        //     sendData.excludeChildDecisionIds = [decisionId];

        //     vm.activeRecommendedTab = {
        //         id: parent.id,
        //         name: parent.name,
        //         nameSlug: parent.nameSlug
        //     };

        //     DecisionDataService.getCriteriaGroupsById(parent.id).then(function(resultCriteria) {
        //         sendData.sortCriteriaIds = pickCriteriaIds(resultCriteria);
        //         vm.criteriaGroups = DecisionsUtils.prepareDecisionToUI(resultCriteria);
        //         DecisionDataService.getDecisionMatrix(parent.id, sendData).then(function(resultDecisions) {
        //             vm.recommendedDecisionsList = filterDecisionList(resultDecisions.decisionMatrixs);
        //             vm.recommendedDecisionsListLoader = false;
        //             vm.activeRecommendedTab.total = resultDecisions.totalDecisionMatrixs;
        //         });
        //     });
        // }

        // TODO: move to service
        // function pickCriteriaIds(result) {
        //     var criteriaGroupsIdsArray = [];
        //     _.forEach(result, function(resultEl) {
        //         _.forEach(resultEl.criteria, function(criteria) {
        //             criteriaGroupsIdsArray.push(criteria.id);
        //         });
        //     });
        //     return criteriaGroupsIdsArray;
        // }
        // END Recommended decisions

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
            initSortMode(key);
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

        // TODO: combine getParentGroupsMatrixAdditional and getParentGroupsMatrix
        function getParentGroupsMatrixAdditional(id, additionalDecisionGroupId) {

            var sendData = {
                // includeChildDecisionIds: [vm.decision.id],
                additionalDecisionGroupId: additionalDecisionGroupId
            };

            if (vm.tabMode === 'topRated') {
                sendData.sortWeightCriteriaDirection = 'DESC';
                sendData.sortTotalVotesCriteriaDirection = 'DESC';
            } else {
                sendData.sortDecisionPropertyName = vm.tabMode;
                sendData.sortDecisionPropertyDirection = 'DESC';
            }

            vm.criteriaGroupsLoader = true;
            vm.characteristicGroupsLoader = true;

            // console.log(id, additionalDecisionGroupId, sendData);
            getParentGroupsCharacterCrit(id).then(function(values) {
                var criteriaGroupsArray = prepareCriteriaGroups(values[0]);
                vm.criteriaGroups = criteriaGroupsArray[0];
                if (vm.tabMode === 'topRated') {
                    sendData.sortCriteriaIds = criteriaGroupsArray[1];
                }

                console.log(sendData);

                DecisionDataService.getDecisionMatrix(id, sendData).then(function(respMatrix) {

                    prepareMatrixResponse(respMatrix, values, null, false);
                    displayMatrixReps(respMatrix);
                });
            });
        }

        function getParentGroupsMatrix(parent, storeCharacteristics) {
            var parentId = parent.id;
            var sendData = {
                includeChildDecisionIds: [vm.decision.id]
            };
            vm.criteriaGroupsLoader = true;
            vm.characteristicGroupsLoader = true;

            getParentGroupsCharacterCrit(parentId).then(function(values) {
                var criteriaGroupsArray = prepareCriteriaGroups(values[0]);
                if (storeCharacteristics !== false) {
                    vm.criteriaGroups = criteriaGroupsArray[0];
                }
                sendData.sortCriteriaIds = criteriaGroupsArray[1];
                console.log(vm.activeParentTab);
                console.log(vm.decisionGroupActive);
                // Request to get decision to display
                getDecisionMatrix(vm.decisionGroupActive.id, null, null, criteriaGroupsArray[1]);

                // Request to get characteristics
                DecisionDataService.getDecisionMatrix(parentId, sendData).then(function(respMatrix) {
                    prepareMatrixResponse(respMatrix, values, storeCharacteristics);
                });

                // Decision Index
                getCriteriaByDecisionIndex(vm.decision.id, parentId, criteriaGroupsArray[1]);
            });
        }

        function prepareMatrixResponse(resp, values, storeCharacteristics, storeCharacteristicsChart) {
            var decisionMatrixs = resp.decisionMatrixs[0];
            var characteristicGroups = _.filter(values[1], function(resultEl) {
                resultEl.characteristics = _.sortBy(resultEl.characteristics, 'createDate');
                _.map(resultEl.characteristics, function(el) {
                    return el;
                });
                if (resultEl.characteristics.length > 0) return resultEl;
            });
            // Criterias IDs

            var criteriaGroups = DecisionsUtils.mergeCriteriaDecision(decisionMatrixs.criteria, values[0]);
            criteriaGroups.totalVotes = calcTotalVotes(criteriaGroups);

            var characteristicGroupsDisplay = mergeCharacteristicsDecisions(resp, characteristicGroups);
            vm.criteriaGroupsLoader = false;

            if (storeCharacteristics !== false) {
                vm.criteriaGroupsCompilance = criteriaGroups;
                vm.characteristicGroups = characteristicGroupsDisplay;
            }

            // Use different data for chart and aside panel
            if (storeCharacteristicsChart !== false) {
                vm.characteristicGroupsChart = angular.copy(characteristicGroupsDisplay);
            }

            if (decisionMatrixs.decision.criteriaCompliancePercentage >= 0) {
                vm.decision.criteriaCompliancePercentage = _.floor(decisionMatrixs.decision.criteriaCompliancePercentage, 2).toFixed(2);
            }
            vm.characteristicGroupsLoader = false;
            vm.decisionsChildsLoaderRequest = false;
        }

        function getParentGroupsCharacterCrit(parentId) {
            return $q.all([
                getCriteriaGroupsByParentId(parentId),
                getCharacteristicsGroupsById(parentId)
            ]);
        }

        function calcTotalVotes(criteriaGroups) {
            return _.sumBy(criteriaGroups, function(group) {
                return _.sumBy(group.criteria, 'totalVotes');
            });
        }

        // Move to component
        function getCriteriaByDecisionIndex(decisionId, parentDecisionId, criteriaGroupsIds) {
            var params = {
                sortCriteriaIds: criteriaGroupsIds,
                sortDecisionPropertyName: 'createDate',
                sortDecisionPropertyDirection: 'DESC',
                sortWeightCriteriaDirection: 'DESC',
                sortTotalVotesCriteriaDirection: 'DESC'
            };
            DecisionDataService.getCriteriaByDecisionIndex(decisionId, parentDecisionId, params).then(function(resp) {
                if (_.isNumber(resp.number)) {
                    vm.decisionIndexInParentGroup = resp.number + 1;
                    vm.decisionIndexInParentGroupPage = _.floor(resp.number / 10) + 1;
                }
            });
        }

        vm.getParentDecisions = getParentDecisions;

        function getParentDecisions(parent) {
            vm.activeParentTab = parent;
            vm.activeChildTab = vm.activeParentTab.ownerDecision.decisionGroups[0];
            getParentGroupsMatrix(vm.activeParentTab);
        }

        vm.getChildDecisions = getChildDecisions;

        function getChildDecisions(child) {
            vm.activeChildTab = child;
            getParentGroupsMatrix(vm.activeParentTab);
        }
    }
})();