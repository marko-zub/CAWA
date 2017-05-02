(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionSingleController', DecisionSingleController);

    DecisionSingleController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce', '$q'];

    function DecisionSingleController($rootScope, decisionBasicInfo, DecisionDataService, $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce, $q) {
        var
            vm = this,
            isInitedSorters = false,
            defaultDecisionCount = 10,
            criteriaIds = [],
            characteristicsIds = [],
            criteriaArray = [],
            characteristicsArray = [];

        vm.decisionId = $stateParams.id;
        vm.decisionsList = [];
        vm.updateDecisionList = [];
        vm.decision = decisionBasicInfo || {};

        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;
        vm.changePageSize = changePageSize;
        vm.changePage = changePage;

        $rootScope.pageTitle = vm.decision.name + ' | DecisionWanted';

        $rootScope.breadcrumbs = [{
            title: 'Decisions',
            link: 'decisions'
        }, {
            title: vm.decision.name,
            link: null
        }];

        init();
        vm.activeTab = 0;
        vm.isDecisionParents = false;

        // TODO: clean up separete for 2 template parent and child
        function init() {
            console.log('Decision Single Controller');
            initPagination();
            getDecisionNomimations($stateParams.id);
            getDecisionParents($stateParams.id);
        }

        function getDecisionNomimations(id) {
            if (!id) return;

            var pagination = _.clone(vm.pagination);
            pagination.pageNumber = pagination.pageNumber - 1;

            DecisionDataService.getDecisionNomination(id, pagination).then(function(result) {
                vm.decisions = descriptionTrustHtml(result.decisions);
                vm.pagination.totalDecisions = result.totalDecisions;
                // console.log(result);
            });
        }

        function getDecisionParents(id) {
            DecisionDataService.getDecisionParents(id).then(function(result) {
                // console.log(result);
                vm.decisionParents = result;

                if (vm.decision.totalChildDecisions) {
                    var decisionCopy = angular.copy(vm.decision);
                    decisionCopy.isActive = true;
                    decisionCopy.name = 'Top ' + decisionCopy.name;
                    vm.decisionParents.unshift(decisionCopy);
                }

                if (vm.decisionParents[0].decisionId !== vm.decision.decisionId) {
                    vm.decisionParents[0].isActive = true;
                    getDecisionParentsCriteriaCharacteristicts(vm.decisionParents);
                    vm.isDecisionParents = true;
                } else {
                    getCriteriaGroupsByIdParent(vm.decision.decisionId);
                }
            });
        }

        // TODO: clean up
        function getDecisionParentsCriteriaCharacteristicts(list) {
            if (list.lenght > 15) return;
            _.forEach(list, function(parent) {

                vm.parentGroups = [];

                var sendData = {
                    includeChildDecisionIds: []
                };
                sendData.includeChildDecisionIds.push(vm.decision.decisionId);
                DecisionDataService.getDecisionMatrix(parent.decisionId, sendData).then(function(result) {
                    var criteriaGroups;
                    $q.all([
                        getCriteriaGroupsById(parent.decisionId, result.decisionMatrixs[0].criteria),
                        getCharacteristictsGroupsById(parent.decisionId, result.decisionMatrixs[0].characteristics)
                    ]).then(function(values) {
                        var parentGroups = {
                            criteriaGroups: values[0],
                            characteristicGroups: values[1]
                        };
                        vm.parentGroups.push(parentGroups);
                    });

                });

            });
        }

        // TODO: move to utils
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                el.description = $sce.trustAsHtml(el.description);
                if (el.criteriaCompliancePercentage) el.criteriaCompliancePercentage = _.floor(el.criteriaCompliancePercentage, 2);
                return el;
            });
        }

        // Pagination
        function changePageSize() {
            vm.pagination.pageNumber = 1;
            getDecisionNomimations($stateParams.id);
            updateStateParams();
        }

        function changePage() {
            getDecisionNomimations($stateParams.id);
            updateStateParams();
        }

        function initPagination() {
            vm.pagination = {
                pageNumber: parseInt($stateParams.page) || 1,
                pageSize: parseInt($stateParams.size) || 10,
                totalDecisions: vm.decision.totalChildDecisions || 10
            };
            // updateStateParams();
        }

        function updateStateParams() {
            // $state.go($state.current.name, {
            //     id: vm.decision.decisionId,
            //     slug: vm.decision.nameSlug,
            //     page: vm.pagination.pageNumber.toString(),
            //     size: vm.pagination.pageSize.toString()
            // }, {
            //     notify: true,
            //     reload: true,
            //     location: 'replace'
            // });
        }


        // TODO: move to service
        function getCriteriaGroupsById(decisionId, criteriaArray) {
            // if(!criteriaArray) return false
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                // vm.criteriaGroups = result;
                criteriaIds = [];
                return _.filter(result, function(resultEl) {
                    _.filter(resultEl.criteria, function(el) {
                        el.description = $sce.trustAsHtml(el.description);
                        var elEqual = _.find(criteriaArray, {
                            criterionId: el.criterionId
                        });

                        if (elEqual) return _.merge(el, elEqual);
                    });

                    return resultEl;
                });
            });
        }


        function getCharacteristictsGroupsById(decisionId, characteristicsArray) {
            // if(!characteristicsArray) return;
            // Characteristicts
            return DecisionDataService.getCharacteristictsGroupsById(decisionId, {
                options: false
            }).then(function(result) {
                // vm.characteristicGroups = result;
                characteristicsIds = [];

                return _.map(result, function(resultEl) {
                    _.map(resultEl.characteristics, function(el) {
                        el.description = $sce.trustAsHtml(el.description);

                        var elEqual = _.find(characteristicsArray, {
                            characteristicId: el.characteristicId
                        });

                        if (elEqual) return _.merge(el, elEqual);
                    });
                    return resultEl;
                });
            });
        }

        function getCriteriaGroupsByIdParent(decisionId) {
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                vm.criteriaGroups = descriptionTrustHtml(result);
                _.forEach(result, function(resultEl) {
                    descriptionTrustHtml(resultEl.criteria);
                });
            });
        }


    }
})();
