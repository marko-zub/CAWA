(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionSingleParentController', DecisionSingleParentController);

    DecisionSingleParentController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', 'DecisionsUtils',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce', '$q', 'ContentFormaterService', 'Utils'
    ];

    function DecisionSingleParentController($rootScope, decisionBasicInfo, DecisionDataService, DecisionsUtils,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce, $q, ContentFormaterService, Utils) {

        var
            vm = this,
            criteriaArray,
            stateId;

        vm.$onInit = onInit;

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            console.log('Decision Single Parent Controller');

            vm.decision = decisionBasicInfo || {};
            vm.criteriaGroupsLoader = true;
            vm.characteristicGroupsLoader = true;

            vm.isDecisionsParent = false;
            if (vm.decision.totalChildDecisions > 0) {
                vm.isDecisionsParent = true;
            }

            stateId = parseInt($stateParams.parentId);

            // getDecisionNomimations(vm.decision.id);
            //
            vm.decisionParents = vm.decision.parentDecisions;
            vm.parent = _.find(vm.decisionParents, function(parent) {
                return parent.id === stateId;
            });
            if (!vm.parent) return;

            if (vm.parent && vm.decision) {
                setPageData();
            }
        }

        function setPageData() {
            vm.parent.description = $sce.trustAsHtml(vm.parent.description);
            getDecisionParentsCriteriaCharacteristicts(vm.parent.id, vm.parent.id);
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

        function getDecisionNomimations(id) {
            if (!id) return;

            DecisionDataService.getDecisionNomination(id, pagination).then(function(result) {
                vm.decisions = DecisionsUtils.prepareDecisionToUI(result.decisions);
                vm.pagination.totalDecisions = result.totalDecisions;
            });
        }

        // TODO: clean up
        // Remove loop
        var criteriaIds = [];

        function getDecisionParentsCriteriaCharacteristicts(parentId, parentUid) {
            var sendData = {
                includeChildDecisionIds: []
            };
            sendData.includeChildDecisionIds.push(vm.decision.id);

            var criteriaGroups;
            $q.all([
                getCriteriaGroupsById(parentId),
                getCharacteristicsGroupsById(parentUid),
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

        function getCharacteristicsGroupsById(id, characteristicsArray) {
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
                sendData.sortCriteriaIds = pickCriteriaIds(criteriaGroups);
                getRecommendedDecisionsRequest(parent.id, sendData);
            } else {
                DecisionDataService.getCriteriaGroupsById(parent.id).then(function(result) {
                    sendData.sortCriteriaIds = pickCriteriaIds(result);
                    getRecommendedDecisionsRequest(parent.id, sendData);
                });
            }
        }

        function getRecommendedDecisionsRequest(parentId, sendData) {
            DecisionDataService.getDecisionMatrix(parentId, sendData).then(function(result) {
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
    }
})();