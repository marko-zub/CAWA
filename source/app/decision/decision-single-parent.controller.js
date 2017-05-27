(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionSingleParentController', DecisionSingleParentController);

    DecisionSingleParentController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce', '$q', 'ContentFormaterService'
    ];

    function DecisionSingleParentController($rootScope, decisionBasicInfo, DecisionDataService,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce, $q, ContentFormaterService) {

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
                    return parent.uid === stateId;
                });


                if(!vm.parent) return;

                vm.parent.description = $sce.trustAsHtml(vm.parent.description);
                getDecisionParentsCriteriaCharacteristicts(vm.parent.id);
                $rootScope.breadcrumbs = [{
                    title: 'Decisions',
                    link: 'decisions'
                }, {
                    title: vm.decision.name,
                    link: 'decisions.single({id:' + vm.decision.uid + ', slug:"' + vm.decision.nameSlug + '"})'
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
        function getDecisionParentsCriteriaCharacteristicts(parentId) {
            var sendData = {
                includeChildDecisionIds: []
            };
            sendData.includeChildDecisionIds.push(vm.decision.id);
            DecisionDataService.getDecisionMatrix(parentId, sendData).then(function(result) {
                var criteriaGroups;
                $q.all([
                    getCriteriaGroupsById(parentId, result.decisionMatrixs[0].criteria),
                    getCharacteristicsGroupsById(parentId, result.decisionMatrixs[0].characteristics)
                ]).then(function(values) {
                    vm.criteriaGroups = values[0];
                    vm.characteristicGroups = values[1];
                });

            });

            // });
        }

        // TODO: move to utils
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                el.description = $sce.trustAsHtml(el.description);
                if (el.criteriaCompliancePercentage) el.criteriaCompliancePercentage = _.floor(el.criteriaCompliancePercentage, 2);
                return el;
            });
        }

        // TODO: move to service
        function getCriteriaGroupsById(id, criteriaArray) {
            // if(!criteriaArray) return false
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(id).then(function(result) {
                // vm.criteriaGroups = result;
                return _.filter(result, function(resultEl) {
                    _.filter(resultEl.criteria, function(el) {
                        el.description = $sce.trustAsHtml(el.description);
                        var elEqual = _.find(criteriaArray, {
                            id: el.id
                        });

                        if (elEqual) return _.merge(el, elEqual);
                    });

                    return resultEl;
                });
            });
        }


        function getCharacteristicsGroupsById(id, characteristicsArray) {
            // if(!characteristicsArray) return;
            // Characteristicts
            return DecisionDataService.getCharacteristicsGroupsById(id, {
                options: false
            }).then(function(result) {
                // vm.characteristicGroups = result;
                var list = _.map(result, function(resultEl) {

                    _.map(resultEl.characteristics, function(el) {
                        el.description = $sce.trustAsHtml(el.description);

                        var elEqual = _.find(characteristicsArray, {
                            id: el.id
                        });

                        // console.log(el);

                        if (elEqual) {
                            el = _.merge(el, elEqual);
                            el.html = ContentFormaterService.getTemplate(el.value, el.valueType);
                            return el;
                        }


                    });
                    return resultEl;
                });

                return list;
            });
        }


    }
})();