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

        vm.decision = DecisionsUtils.prepareDecisionSingleToUI(decisionBasicInfo, true, false) || {};
        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;
        vm.$onInit = onInit;

        // Change every time
        var criteriaGroupsIds = [];
        var navigationObj = angular.copy(DecisionsConstant.NAVIGATON_STATES);
        navigationObj.unshift(DecisionsConstant.NAVIGATON_STATES_TOP_RATED);

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            vm.activeTabSortChild = 0;

            // console.log('Decision Single Controller');
            vm.navigation = navigationObj;
            initPagination();

            var mediaLogo = _.find(vm.decision.medias, function(media) {
                return media.type === 'LOGO';
            });

            if (mediaLogo) vm.decision.imageUrl = mediaLogo.url;

            setPageData();
            changeDecisionGroupsTabOnly($stateParams.category);
            changeSortMode($stateParams.sort);

            // Call only on init
            getDecisionParents(vm.decision);

            vm.criteriaGroupsLoader = true;
            vm.characteristicGroupsLoader = true;

            setImageSize();
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
                        img.css({
                            height: (img[0].naturalHeight > 0 && img[0].naturalHeight < 180) ? img[0].naturalHeight + 'px' : '180px',
                            width: (img[0].naturalWidth > 0 && img[0].naturalWidth < 180) ? img[0].naturalWidth + 'px' : '180px'
                        });
                    }
                }
            });
        }

        vm.changeDecisionGroupsTab = changeDecisionGroupsTab;

        function changeDecisionGroupsTab(mode) {
            changeDecisionGroupsTabOnly(mode);
            changeSortMode($stateParams.sort);
            sortModeRequest();

            // if (vm.decisionGroupActive.inheritedDecisionGroupId) {
            //     console.log('inheritedDecisionGroupId');
            //     // sendData.additionalDecisionGroupId = vm.decisionGroupActive.id;
            //     // console.log(sendData);
            // } else {
            //     console.log('DecisionGroupId')
            // }
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
        }

        // TODO: Simplify logic
        function changeSortMode(mode, isRequest) {
            if (vm.decisionGroupActive && vm.decisionGroupActive.id) {
                var findIndex = _.findIndex(navigationObj, function(navItem) {
                    return navItem.key === mode;
                });

                if (findIndex >= 0 && !_.isNull(mode)) {
                    vm.tabMode = navigationObj[findIndex].value;
                    vm.activeTabSort = findIndex;
                    // Hide criterias
                    vm.criteriaGroups = [];
                } else {
                    vm.tabMode = 'topRated';
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

        function sortModeRequest() {
            // Don't call matrix
            if (vm.decisionGroupActive && vm.decisionGroupActive.totalChildDecisions === 0) {
                vm.decisions = [];
                return;
            }

            // null equals 'topRated';
            if (_.isNull(vm.tabMode) || vm.tabMode === 'topRated') {
                if (vm.decisionGroupActive.inheritedDecisionGroupId) {
                    var inheritedDecisionGroupId = vm.decisionGroupActive.inheritedDecisionGroupId;
                    getCriteriaGroupsByParentId(inheritedDecisionGroupId).then(function(resp) {
                        var additionalDecisionGroupId = vm.decisionGroupActive.id;
                        var preparedCriteriaGroups = prepareCriteriaGroups(resp);
                        vm.criteriaGroups = preparedCriteriaGroups[0];
                        getDecisionMatrix(inheritedDecisionGroupId, false, false, additionalDecisionGroupId, preparedCriteriaGroups[1]).then(function() {
                            vm.criteriaGroupsLoader = false;
                        });
                    });
                } else {
                    getCriteriaGroupsByParentId(vm.decision.id).then(function(resp) {
                        var preparedCriteriaGroups = prepareCriteriaGroups(resp);
                        getDecisionMatrix(vm.decisionGroupActive.id, false, false, false, preparedCriteriaGroups[1]).then(function() {
                            vm.criteriaGroupsLoader = false;
                        });
                    });
                }
            } else {
                getDecisionMatrix(vm.decisionGroupActive.id);
            }
        }

        function getDecisionParents(decision) {
            vm.decisionsChildsLoader = true;
            vm.decisionParents = decision.parentDecisions;

            // decisionGroups
            vm.parentDecisionGroups = decision.parentDecisionGroups;
            // TODO: check if we need this code
            // if (vm.decision.decisionGroups) {
            //     vm.decisionsChildsLoader = true;
            //     vm.activeDecisionGroupsTab = {
            //         id: vm.decisionGroupActive.id,
            //         name: vm.decisionGroupActive.name,
            //         nameSlug: vm.decisionGroupActive.nameSlug
            //     };

            //     var sendData = {};
            //     sendData.includeCharacteristicIds = [-1];
            //     // sendData.sortDecisionPropertyName = vm.tabMode;
            //     sendData.sortDecisionPropertyDirection = 'DESC';

            //     if (vm.decisionGroupActive && vm.decisionGroupActive.totalChildDecisions === 0) {
            //         vm.decisions = [];
            //         vm.decisionsChildsLoader = false;
            //         return;
            //     }

            //     // DecisionDataService.getDecisionGroups(vm.decisionGroupActive.id, sendData).then(function(result) {
            //     //     // console.log(result)
            //     //     var childDecisionGroups = [];
            //     //     vm.childDecisionGroups = _.filter(result.decisionMatrixs, function(decision) {
            //     //         childDecisionGroups.push(decision.decision);
            //     //     });

            //     //     vm.childDecisionGroups = childDecisionGroups;
            //     //     vm.decisionsChildsLoader = false;
            //     // });
            // }

            vm.parentDecisionGroupsTabs = decision.parentDecisionGroups;
            if (vm.parentDecisionGroups && vm.parentDecisionGroups.length) {
                // getRecommendedDecisions(vm.decision.id, vm.parentDecisionGroups[0]);
                getParentDecisionGroupsCriteriaCharacteristicts(vm.parentDecisionGroups[0]);
                vm.activeParentTab = vm.parentDecisionGroups[0];
                vm.activeChildTab = vm.activeParentTab.ownerDecision.decisionGroups[0];
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
                vm.decisions = filterDecisionList(result.decisionMatrixs);
                vm.decisionsChildsLoader = false;
                vm.decisionsChildsLoaderRequest = false;

                vm.pagination = initPagination(result.totalDecisionMatrixs, $stateParams.page, $stateParams.size);
                vm.pagination.totalDecisions = result.totalDecisionMatrixs;
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
        }

        // // TODO: move to login to recommended component
        // // Recommended decisions
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

        // // TODO: move to service
        // function pickCriteriaIds(result) {
        //     var criteriaGroupsIdsArray = [];
        //     _.forEach(result, function(resultEl) {
        //         _.forEach(resultEl.criteria, function(criteria) {
        //             criteriaGroupsIdsArray.push(criteria.id);
        //         });
        //     });
        //     return criteriaGroupsIdsArray;
        // }
        // // End Recommended decisions

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

        function getParentDecisionGroupsCriteriaCharacteristicts(parent) {
            var sendData = {
                includeChildDecisionIds: [vm.decision.id]
            };
            var parentId = parent.id;

            vm.criteriaGroupsLoader = true;
            vm.characteristicGroupsLoader = true;

            $q.all([
                getCriteriaGroupsByParentId(parentId),
                getCharacteristicsGroupsById(parentId),
            ]).then(function(values) {

                var preparedCriteriaGroups = prepareCriteriaGroups(values[0])
                vm.criteriaGroups = preparedCriteriaGroups[0];

                var characteristicGroups = _.filter(values[1], function(resultEl) {
                    resultEl.characteristics = _.sortBy(resultEl.characteristics, 'createDate');
                    _.map(resultEl.characteristics, function(el) {
                        return el;
                    });
                    if (resultEl.characteristics.length > 0) return resultEl;
                });

                // Criterias IDs
                // TODO: use getDecisionMatrix
                // console.log(criteriaGroupsIds);
                if (vm.tabMode === 'topRated' || _.isNull(vm.tabMode)) {
                    sendData.sortCriteriaIds = criteriaGroupsIds;
                    sendData.sortWeightCriteriaDirection = 'DESC';
                    sendData.sortTotalVotesCriteriaDirection = 'DESC';
                } else {
                    sendData.sortDecisionPropertyName = vm.tabMode;
                    sendData.sortDecisionPropertyDirection = 'DESC';
                }

                DecisionDataService.getDecisionMatrix(parentId, sendData).then(function(resp) {
                    var criteriaGroups = DecisionsUtils.mergeCriteriaDecision(resp.decisionMatrixs[0].criteria, values[0]);
                    criteriaGroups.totalVotes = calcTotalVotes(criteriaGroups);
                    vm.criteriaGroupsCompilance = criteriaGroups;
                    vm.criteriaGroupsLoader = false;

                    vm.characteristicGroups = mergeCharacteristicsDecisions(resp, characteristicGroups);

                    // Use different data for chart and aside panel
                    vm.characteristicGroupsChart = angular.copy(vm.characteristicGroups);

                    var decisionMatrixs = resp.decisionMatrixs;
                    vm.decision.criteriaCompliancePercentage = _.floor(decisionMatrixs[0].decision.criteriaCompliancePercentage, 2).toFixed(2);
                    vm.characteristicGroupsLoader = false;
                });

                // Display matrix
                // getDecisionMatrix(vm.decisionGroupActive.id);
                sortModeRequest();

                // Decision Index
                getCriteriaByDecisionIndex(vm.decision.id, parentId, criteriaGroupsIds);
            });
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

        vm.getParrentDecisions = getParrentDecisions;

        function getParrentDecisions(parent) {
            vm.activeParentTab = parent;
            vm.activeChildTab = vm.activeParentTab.ownerDecision.decisionGroups[0];
            getParentDecisionGroupsCriteriaCharacteristicts(vm.activeParentTab);
        }

        vm.getChildDecisions = getChildDecisions;

        function getChildDecisions(child) {
            vm.activeChildTab = child;
            getParentDecisionGroupsCriteriaCharacteristicts(vm.activeParentTab);
        }
    }
})();