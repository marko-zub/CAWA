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

        var decision = DecisionsUtils.prepareDecisionSingleToUI(decisionBasicInfo, true, false) || {};
        vm.decision = DecisionsUtils.prepareDecisionLogoToUI(decision);
        vm.$onInit = onInit;

        // Change every time
        var criteriaGroupsIds = [];

        // TODO: clean up separete for 2 template parent and child
        function onInit() {

            changeDecisionGroupsTabOnly($stateParams.category);

            // Call only on init
            getDecisionParents(vm.decision);
            setPageData();
            checAffiliateDisclosure();
        }

        // TODO: Move to service
        function checAffiliateDisclosure() {
            var find = _.find(vm.decision.medias, function(media) {
                return media.platform && media.platform.toLowerCase() === 'amazon';
            });
            if (find) {
                vm.showAffiliateDisclosure = true;
            }
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
            $rootScope.ogImage = vm.decision.metaOgImage;
            $rootScope.oggDescription = vm.decision.oggDescription ?  vm.decision.oggDescription : '';
            // if ($stateParams.category || tab) {
            //     $rootScope.pageTitle = vm.decision.name + ' ' + vm.decisionGroupActive.name + ' | ' + Config.pagePrefix;
            // } else {
            //     $rootScope.pageTitle = vm.decision.name + ' | ' + Config.pagePrefix;
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

        vm.onChangeTab = onChangeTab;

        function onChangeTab(tab) {
            vm.decisionGroupActive = tab;
            // setPageData(tab);
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
                getParentDecisionGroupsCriteriaCharacteristicts(vm.parentDecisionGroups[0]);
                vm.activeParentTab = vm.parentDecisionGroups[0];
                vm.activeChildTab = vm.activeParentTab.ownerDecision.decisionGroups[0];
            } else if (vm.decisionGroupActive) {
                // sortModeRequest();
            }
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
        //

        // function filterDecisionList(decisionMatrixs) {
        //     var list = [];
        //     _.forEach(decisionMatrixs, function(item) {
        //         item.decision.criteria = item.criteria;
        //         list.push(item.decision);
        //     });
        //     return angular.copy(list);
        // }
        // End Recommended decisions


        // TODO: simplify right block
        // Remove second criteria call
        function getCharacteristicsGroupsById(id) {
            return DecisionDataService.getCharacteristicsGroupsById(id, {
                options: false
            }).then(function(result) {
                return result;
            });
        }

        function getParentDecisionGroupsCriteriaCharacteristicts(parent) {
            var parentId = parent.id;

            vm.criteriaGroupsLoader = true;
            vm.characteristicGroupsLoader = true;

            vm.criteriaGroupsCompilanceInit = true;
            vm.characteristicGroupsInit = true;

            $q.all([
                getCriteriaGroupsByParentId(parentId),
                getCharacteristicsGroupsById(parentId),
            ]).then(function(values) {

                var preparedCriteriaGroups = prepareCriteriaGroups(values[0]);
                vm.criteriaGroups = preparedCriteriaGroups[0];

                var characteristicGroups = _.filter(values[1], function(resultEl) {
                    if (resultEl.characteristics.length > 0) {
                        resultEl.characteristics = _.chain(resultEl.characteristics)
                            .sortBy('createDate')
                            .value();
                        return resultEl;
                    }
                });

                var sendData = {
                    includeChildDecisionIds: [vm.decision.id],
                    sortDecisionPropertyDirection: 'DESC'
                };
                DecisionDataService.getDecisionMatrix(parentId, sendData).then(function(resp) {
                    var decisionMatrixs = resp.decisionMatrixs;
                    vm.decisionMatrixs = decisionMatrixs;

                    var criteriaGroups = DecisionsUtils.mergeCriteriaDecision(decisionMatrixs[0].criteria, values[0]);
                    criteriaGroups.totalVotes = calcTotalVotes(criteriaGroups);
                    vm.criteriaGroupsCompilance = criteriaGroups;
                    vm.criteriaGroupsLoader = false;

                    vm.isSharacteristicGroupsChart = showChart(decisionMatrixs);
                    // console.log(vm.isSharacteristicGroupsChart);
                    // Use different data for chart and aside panel
                    // Pass pure chracterisctics response
                    vm.characteristicGroupsChart = _.map(angular.copy(characteristicGroups), function(characteristic) {

                        if (characteristic.description) {
                            characteristic.description = $sce.trustAsHtml(characteristic.description);
                        }
                        return characteristic;

                    });

                    vm.characteristicGroups = DecisionsUtils.mergeCharacteristicsDecisions(decisionMatrixs[0], characteristicGroups);

                    vm.decision.criteriaCompliancePercentage = _.floor(decisionMatrixs[0].decision.criteriaCompliancePercentage, 2).toFixed(2);
                    vm.characteristicGroupsLoader = false;
                });

                // Decision Index
                getCriteriaByDecisionIndex(vm.decision.id, parentId, criteriaGroupsIds);
            });
        }

        function showChart(decisions) {
            var showChart = false;
            if (decisions && decisions[0]) {
                var find = _.find(decisions[0].characteristics, function (characteristic) {
                    return characteristic.totalHistoryValues > 0;
                });

                if (find) {
                    showChart = true;
                }
            }
            return showChart;
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
            getParentDecisionGroupsCriteriaCharacteristicts(vm.activeParentTab);
        }

        vm.getChildDecisions = getChildDecisions;

        function getChildDecisions(child) {
            vm.activeChildTab = child;
            getParentDecisionGroupsCriteriaCharacteristicts(vm.activeParentTab);
        }
    }
})();