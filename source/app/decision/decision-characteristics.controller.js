(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionCharacteristicsController', DecisionCharacteristicsController);

    DecisionCharacteristicsController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', 'DecisionsUtils',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce', '$q'
    ];

    function DecisionCharacteristicsController($rootScope, decisionBasicInfo, DecisionDataService, DecisionsUtils,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce, $q) {

        var
            vm = this,
            criteriaArray;

        vm.$onInit = onInit;

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            console.log('Decision Characteristics Controller');

            vm.decision = decisionBasicInfo || {};
            vm.criteriaGroupsLoader = true;
            vm.characteristicGroupsLoader = true;

            vm.isDecisionsParent = false;
            if (vm.decision.totalChildDecisions > 0) {
                vm.isDecisionsParent = true;
            }

            vm.ParentDecisionGroups = vm.decision.parentDecisionGroups;

            if ($stateParams.characteristicSlug) {
                // console.log($stateParams.characteristicSlug);
                vm.parent = changeCategory($stateParams.characteristicSlug);
            } else {
                if (vm.decision.parentDecisionGroups) {
                    vm.parent = vm.decision.parentDecisionGroups[0];
                    vm.categoryTabIndex = 0;
                }

                // Init first time slugs
                // var params = $state.params;
                // params.characteristicSlug = vm.decision.parentDecisionGroups[0].ownerDecision.nameSlug;
                // params.category = vm.decision.parentDecisionGroups[0].nameSlug;
                // $state.go($state.current.name, params ,{
                //     reload: false,
                //     notify: false
                // });
            }

            if (vm.parent && vm.decision) {
                setPageData();
            }

            if ($stateParams.category) {
                changeCategory($stateParams.category);
            }
        }

        function changeCategory(slug) {
            var categoryIndex = _.findIndex(vm.decision.parentDecisionGroups, function(parentDecisionGroup) {
                return parentDecisionGroup.ownerDecision.nameSlug === slug;
            });
            vm.categoryTabIndex = categoryIndex;
            return vm.decision.parentDecisionGroups[categoryIndex];
        }

        vm.changeCategoryTab = changeCategoryTab;

        function changeCategoryTab(slug) {
            changeCategory(slug);
        }

        // function findParentId(slug) {
        //     return _.find(vm.decision.parentDecisionGroups, function(parentDecision) {
        //         return parentDecision.nameSlug === slug;
        //     });
        // }

        function setPageData() {
            vm.parent.description = $sce.trustAsHtml(vm.parent.description);
            getParentDecisionGroupsCriteriaCharacteristicts(vm.parent.id);
            $rootScope.breadcrumbs = [{
                title: 'Decisions',
                link: 'decisions'
            }, {
                title: vm.decision.name,
                link: 'decisions.single({id:' + vm.decision.id + ', slug:"' + vm.decision.nameSlug + '"})'
            }, {
                title: vm.parent.name,
                link: null
            }];

            $rootScope.pageTitle = vm.decision.name + ' ' + vm.parent.name + ' | DecisionWanted.com';
        }

        // TODO: clean up
        // Remove loop
        var criteriaIds = [];

        function getParentDecisionGroupsCriteriaCharacteristicts(parentId) {
            var sendData = {
                includeChildDecisionIds: []
            };
            sendData.includeChildDecisionIds.push(vm.decision.id);

            $q.all([
                getCriteriaGroupsById(parentId),
                getCharacteristicsGroupsById(parentId),
            ]).then(function(values) {

                criteriaArray = values[0];
                var characteristicGroups = _.filter(values[1], function(resultEl) {
                    resultEl.characteristics = _.sortBy(resultEl.characteristics, 'createDate');
                    _.map(resultEl.characteristics, function(el) {
                        return el;
                    });
                    if (resultEl.characteristics.length > 0) return resultEl;
                });

                // Criterias IDs
                _.forEach(values[0], function(criteriaItem) {
                    _.forEach(criteriaItem.criteria, function(criteria) {
                        criteriaIds.push(criteria.id);
                    });
                });

                sendData.sortCriteriaIds = criteriaIds;

                DecisionDataService.getDecisionMatrix(parentId, sendData).then(function(resp) {
                    var criteriaGroups = DecisionsUtils.mergeCriteriaDecision(resp.decisionMatrixs[0].criteria, values[0]);
                    criteriaGroups.totalVotes = _.sumBy(criteriaGroups, function(group) {
                        return _.sumBy(group.criteria, 'totalVotes');
                    });
                    vm.criteriaGroups = criteriaGroups;
                    vm.criteriaGroupsLoader = false;

                    vm.characteristicGroups = mergeCharacteristicsDecisions(resp, characteristicGroups);
                    var decisionMatrixs = resp.decisionMatrixs;
                    vm.decision.criteriaCompliancePercentage = _.floor(decisionMatrixs[0].decision.criteriaCompliancePercentage, 2).toFixed(2);
                    vm.characteristicGroupsLoader = false;

                    getRecommendedDecisions(vm.decision.id, vm.parent, criteriaArray);
                });
            });
        }

        // TODO: move to service
        function getCriteriaGroupsById(id) {
            return DecisionDataService.getCriteriaGroupsById(id).then(function(result) {
                return result;
            });
        }

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


        // Recommended decisions
        vm.getRecommendedDecisions = getRecommendedDecisions;

        function getRecommendedDecisions(decisionId, parent, criteriaGroups) {
            if (!parent) return;
            var sendData = {
                includeCharacteristicIds: [-1],
                sortWeightCriteriaDirection: 'DESC',
                sortTotalVotesCriteriaDirection: 'DESC',
                sortCriteriaIds: pickCriteriaIds(criteriaArray)
            };
            sendData.excludeChildDecisionIds = [decisionId];

            vm.activeRecommendedTab = {
                id: parent.id,
                name: parent.name,
                nameSlug: parent.nameSlug,
            };

            if (criteriaGroups) {
                var criteriaGroupsIds = pickCriteriaIds(criteriaGroups);
                sendData.sortCriteriaIds = criteriaGroupsIds;
                getRecommendedDecisionsRequest(parent.id, sendData);

                getCriteriaByDecisionIndex(vm.decision.id, parent.id, criteriaGroupsIds);
            } else {
                DecisionDataService.getCriteriaGroupsById(parent.id).then(function(result) {
                    sendData.sortCriteriaIds = pickCriteriaIds(result);
                    getRecommendedDecisionsRequest(parent.id, sendData);
                });
            }
        }

        function getRecommendedDecisionsRequest(parentId, sendData) {
            return DecisionDataService.getDecisionMatrix(parentId, sendData).then(function(result) {
                vm.recommendedDecisionsList = filterDecisionList(result.decisionMatrixs);
                vm.recommendedDecisionsListLoader = false;
                vm.activeRecommendedTab.total = result.totalDecisionMatrixs;
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

        // Move to component
        function getCriteriaByDecisionIndex (decisionId, parentDecisionId, criteriaIds) {
            if (_.isEmpty(criteriaIds)) return;
            var criteriaIdsString = criteriaIds.join(',');
            DecisionDataService.getCriteriaByDecisionIndex(decisionId, parentDecisionId, criteriaIdsString).then(function(resp) {
                if (_.isNumber(resp.number)) {
                    vm.decisionIndexInParentGroup = resp.number + 1;
                    vm.decisionIndexInParentGroupPage = _.floor(resp.number/10) + 1;
                }
            });
        }        
    }
})();