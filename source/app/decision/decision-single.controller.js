(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionSingleController', DecisionSingleController);

    DecisionSingleController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', 'DecisionsConstant',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce', '$q', 'ContentFormaterService'
    ];

    function DecisionSingleController($rootScope, decisionBasicInfo, DecisionDataService, DecisionsConstant,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce, $q, ContentFormaterService) {

        var
            vm = this;

        vm.decision = decisionBasicInfo || {};

        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;
        vm.changePageSize = changePageSize;
        vm.changePage = changePage;

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
            console.log('Decision Single Controller');
            vm.navigation = navigationObj;
            initPagination();
            getDecisionParents(vm.decision.id);

            $rootScope.pageTitle = vm.decision.name + ' | DecisionWanted';
        }

        // TODO: Simplify logic
        function initSortMode(mode) {
            if (!mode) {
                vm.activeTabSort = 1;
            }
            var find = _.find(navigationObj, function(navItem) {
                return navItem.key === mode;
            });
            if (find && find.key !== 'topRated') {
                vm.tabMode = find.value;
                getDecisionMatrix(vm.decision.id);
                // Hide criterias
                vm.criteriaGroups = [];
            } else {
                vm.tabMode = 'topRated';
                getCriteriaGroupsByParentId(vm.decision.id).then(function() {
                    var sendData = {
                        sortCriteriaIds: criteriaGroupsIds,
                        sortWeightCriteriaDirection: 'DESC',
                        sortTotalVotesCriteriaDirection: 'DESC'
                    };

                    getDecisionMatrix(vm.decision.id, sendData);
                });

                $state.go($state.current.name, {
                    tab: null
                }, {
                    reload: false,
                    notify: false
                });
            }
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

                if (vm.decision.totalChildDecisions > 0) {
                    vm.isDecisionsParent = true;
                    vm.decisionsSpinnerChilds = true;
                    initSortMode($stateParams.tab);
                }

                return result;
            });
        }

        function getDecisionMatrix(id, data) {
            var sendData = data;
            if (!sendData) {
                sendData = {
                    sortDecisionPropertyName: vm.tabMode,
                    sortDecisionPropertyDirection: 'DESC'
                };
            }
            DecisionDataService.getDecisionMatrix(id, sendData).then(function(result) {
                vm.decisions = [];
                var decisions = [];
                _.forEach(result.decisionMatrixs, function(decision) {
                    decisions.push(decision.decision);
                });
                vm.decisions = descriptionTrustHtml(decisions);
                vm.decisionsSpinnerChilds = false;
            });
        }

        // TODO: clean up
        // Remove loop
        function getDecisionParentsCriteriaCharacteristicts(parent) {
            var sendData = {
                includeChildDecisionIds: []
            };
            sendData.includeChildDecisionIds.push(vm.decision.id);
            DecisionDataService.getDecisionMatrix(parent.id, sendData).then(function(result) {
                var criteriaGroups;
                $q.all([
                    getCriteriaGroupsById(parent.id, result.decisionMatrixs[0].criteria),
                    getCharacteristicsGroupsById(parent.id, result.decisionMatrixs[0].characteristics)
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

                if (el.description && el.description.length > 80) {
                    el.description = el.description.substring(0, 80) + '...';
                }

                el.description = $sce.trustAsHtml(el.description);
                if (el.criteriaCompliancePercentage) el.criteriaCompliancePercentage = _.floor(el.criteriaCompliancePercentage, 2);
                return el;
            });
        }

        // Pagination
        function changePageSize() {
            vm.pagination.pageNumber = 1;
            getDecisionNomimations(vm.decision.id);
            updateStateParams();
        }

        function changePage() {
            getDecisionNomimations(vm.decision.id);
            updateStateParams();
        }

        function initPagination() {
            vm.pagination = {
                pageNumber: parseInt($stateParams.page) || 1,
                pageSize: parseInt($stateParams.size) || 10,
                totalDecisions: vm.decision.totalChildDecisions || 10
            };

            vm.decisionsHeight = vm.pagination.pageSize * 97 + 'px';
            // updateStateParams();
        }

        function updateStateParams() {
            // $state.go($state.current.name, {
            //     id: vm.decision.id,
            //     slug: vm.decision.nameSlug,
            //     page: vm.pagination.pageNumber.toString(),
            //     size: vm.pagination.pageSize.toString()
            // }, {
            //     notify: true,
            //     reload: true,
            //     location: false
            // });
        }


        // TODO: move to service
        function getCriteriaGroupsById(id, criteriaArray) {
            // if(!criteriaArray) return false
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(id).then(function(result) {
                // vm.criteriaGroups = result;
                _.filter(result, function(resultEl) {
                    _.filter(resultEl.criteria, function(el) {
                        el.description = $sce.trustAsHtml(el.description);
                        var elEqual = _.find(criteriaArray, {
                            id: el.id
                        });

                        if (elEqual) return _.merge(el, elEqual);
                    });

                    if (resultEl.criteria.length > 0) return resultEl;
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
                    resultEl.isCollapsed = true;
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
                list[0].isCollapsed = false;
                return list;
            });
        }

        function getCriteriaGroupsByParentId(id) {
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(id).then(function(result) {
                result = _.filter(result, function(group) {
                    if (group.criteria.length > 0) return group;
                });
                vm.criteriaGroups = descriptionTrustHtml(result);
                _.forEach(result, function(resultEl) {
                    descriptionTrustHtml(resultEl.criteria);

                    _.forEach(resultEl.criteria, function(criteria) {
                        criteriaGroupsIds.push(criteria.id);
                    });
                });

                return result;
            });
        }


    }
})();