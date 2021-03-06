(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionSingleParentController', DecisionSingleParentController);

    DecisionSingleParentController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce', '$q', 'ContentFormaterService', 'Utils'
    ];

    function DecisionSingleParentController($rootScope, decisionBasicInfo, DecisionDataService,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce, $q, ContentFormaterService, Utils) {

        var
            vm = this,
            stateId;

        vm.$onInit = onInit;

        // TODO: clean up separete for 2 template parent and child
        function onInit() {
            console.log('Decision Single Parent Controller');

            vm.decision = decisionBasicInfo || {};

            vm.isDecisionsParent = false;
            if (vm.decision.totalChildDecisions > 0) {
                vm.isDecisionsParent = true;
            }

            stateId = parseInt($stateParams.parentId);

            // getDecisionNomimations(vm.decision.id);
            getDecisionParents(vm.decision.id).then(function(result) {
                vm.parent = _.find(result, function(parent) {
                    return parent.id === stateId;
                });

                if (!vm.parent) return;

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

                $rootScope.pageTitle = vm.decision.name + ' ' + vm.parent.name + ' | DecisionWanted';
            });
        }

        function getDecisionNomimations(id) {
            if (!id) return;

            DecisionDataService.getDecisionNomination(id, pagination).then(function(result) {
                vm.decisions = descriptionTrustHtml(result.decisions);
                vm.pagination.totalDecisions = result.totalDecisions;
            });
        }

        function getDecisionParents(id) {
            return DecisionDataService.getDecisionParents(id).then(function(result) {
                // console.log(result);
                vm.decisionParents = result;
                return result;
            });
        }

        // TODO: clean up
        // Remove loop
        function getDecisionParentsCriteriaCharacteristicts(parentId, parentUid) {
            var sendData = {
                includeChildDecisionIds: []
            };
            sendData.includeChildDecisionIds.push(vm.decision.id);

            var criteriaIds = [];
            var criteriaGroups;
            $q.all([
                getCriteriaGroupsById(parentId),
                getCharacteristicsGroupsById(parentUid),
            ]).then(function(values) {

                vm.characteristicGroups = _.filter(values[1], function(resultEl) {
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
                    vm.criteriaGroups = mergeCriteriaDecisions(resp, values[0]);
                    mergeCharacteristicsDecisions(resp, vm.characteristicGroups);

                    var decisionMatrixs = resp.decisionMatrixs;
                    vm.decision.criteriaCompliancePercentage = _.floor(decisionMatrixs[0].decision.criteriaCompliancePercentage, 2);
                });
            });
        }

        // TODO: move to utils
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {

                if (el.description && el.description.length > 80) {
                    el.description = el.description.substring(0, 80) + '...';
                }

                el.description = $sce.trustAsHtml(el.description);
                if (el.criteriaCompliancePercentage) el.criteriaCompliancePercentage = _.floor(el.criteriaCompliancePercentage, 2);
                return el;
            });
        }

        // TODO: move to service
        function getCriteriaGroupsById(id) {
            return DecisionDataService.getCriteriaGroupsById(id).then(function(result) {
                return result;
            });
        }

        function mergeCriteriaDecisions(decisions, criteriaGroupsArray) {
            var currentDecisionCriteria = decisions.decisionMatrixs[0].criteria;
            return _.filter(criteriaGroupsArray, function(resultEl) {
                _.filter(resultEl.criteria, function(el) {
                    el.description = $sce.trustAsHtml(el.description);

                    var elEqual = _.find(currentDecisionCriteria, {
                        id: el.id
                    });

                    if (elEqual) return _.merge(el, elEqual);
                });

                if (resultEl.criteria.length > 0) return resultEl;
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
            var list = _.filter(characteristicsArray, function(resultEl) {
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


    }
})();