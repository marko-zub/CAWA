(function() {
    // TODO: clean up remove repeated code
    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionSingleController', DecisionSingleController);

    DecisionSingleController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', 'DecisionsConstant',
        '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', 'DecisionsUtils', '$q', 'ContentFormaterService',
        'Config', 'DecisionCompareNotificationService'
    ];

    function DecisionSingleController($rootScope, decisionBasicInfo, DecisionDataService, DecisionsConstant,
        $stateParams, DecisionSharedService, PaginatorConstant, $state, DecisionsUtils, $q, ContentFormaterService,
        Config, DecisionCompareNotificationService) {

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
            vm.activeTabSortChild = 0;
            console.log('Decision Single Controller');
            vm.navigation = navigationObj;
            initPagination();
            getDecisionParents(vm.decision.id);

            $rootScope.pageTitle = vm.decision.name + ' | ' + Config.pagePrefix;

            var mediaLogo = _.find(vm.decision.medias, function(media) {
                return media.type === 'LOGO';
            });

            if (mediaLogo) vm.decision.imageUrlLogo = mediaLogo.url;

            $rootScope.breadcrumbs = [{
                title: 'Decisions',
                link: 'decisions'
            }, {
                title: vm.decision.name,
                link: null
            }];

            getProperties(vm.decision.id);
        }

        // Move to component
        function getProperties(id) {
            vm.propertiesDecisionsListLoader = true;
            $q.all([
                DecisionDataService.getDecisionsPropertyGroups(id),
                DecisionDataService.getDecisionsProperties(id)

            ]).then(function(values) {

                // vm.decisionsPropertyGroups = values[0];
                // vm.decisionsProperties = values[1];

                var propertiesValues = _.orderBy(values[1], 'id');
                vm.properties = _.filter(values[0], function(item) {
                    // console.log();
                    return _.filter(item.properties, function(property) {
                        property.value = _.find(propertiesValues, function(val) {
                            return val.id === property.id;
                        });
                        return property;
                    });

                });
                vm.propertiesDecisionsListLoader = false;
                // console.log(values[0]);
                // console.log(properties);
                // console.log(propertiesValues);
            });

        }

        // TODO: Simplify logic
        function initSortMode(mode) {

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
                    getDecisionMatrix(vm.decision.id);
                });
                vm.activeTabSort = 1;

                $state.params.tab = null;
                $state.transitionTo($state.current.name, $state.params, {
                    reload: false,
                    inherit: true,
                    notify: false
                });
            }
        }

        function getDecisionParents(id) {
            vm.decisionsChildsLoader = true;
            DecisionDataService.getDecisionParents(id).then(function(result) {
                // console.log(result);
                vm.decisionParents = result;

                if (vm.decision.totalChildDecisions > 0) {
                    vm.isDecisionsParent = true;

                    vm.totalCount = vm.decision.totalChildDecisions;

                    initSortMode($stateParams.tab);
                }

                // Recommended Decisions
                if (vm.decisionParents.length) {
                    vm.recommendedDecisionsListLoader = true;
                    vm.activeRecommendedTab = {
                        id: vm.decisionParents[0].id,
                        name: vm.decisionParents[0].name
                    };
                    getRecommendedDecisions(vm.decision.id, vm.decisionParents[0]);
                }

                return result;
            });
        }

        function getDecisionMatrix(id, filter) {
            var sendData = {};
            var pagination = _.clone(vm.pagination);

            pagination.pageNumber = pagination.pageNumber - 1;
            if (pagination) {
                sendData.pageNumber = pagination.pageNumber;
                sendData.pageSize = pagination.pageSize;
            }

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
            DecisionDataService.getDecisionMatrix(id, sendData).then(function(result) {
                vm.decisions = [];
                var decisions = [];
                _.forEach(result.decisionMatrixs, function(decision) {
                    decisions.push(decision.decision);
                });
                vm.decisions = DecisionsUtils.prepareDecisionToUI(decisions);
                vm.decisionsChildsLoader = false;

                vm.pagination.totalDecisions = result.totalDecisionMatrixs;
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
        }

        // Pagination
        function changePageSize() {
            vm.pagination.pageNumber = 1;
            getDecisionMatrix(vm.decision.id);
            updateStateParams();
        }

        function changePage() {
            getDecisionMatrix(vm.decision.id);
            updateStateParams();
        }

        function initPagination() {
            vm.pagination = {
                pageNumber: parseInt($stateParams.page) || 1,
                pageSize: parseInt($stateParams.size) || 10,
                totalDecisions: vm.decision.totalChildDecisions || 10
            };

            vm.decisionsHeight = vm.pagination.pageSize * 70 + 'px';
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
                    resultEl.isCollapsed = true;
                    _.map(resultEl.characteristics, function(el) {
                        el.description = $sce.trustAsHtml(el.description);

                        var elEqual = _.find(characteristicsArray, {
                            id: el.id
                        });

                        // console.log(el);

                        if (elEqual) {
                            el = _.merge(el, elEqual);
                            el.html = ContentFormaterService.getTemplate(el);
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

        // TODO: make component
        // Filter
        vm.clearFilterName = clearFilterName;
        vm.filterNameSubmit = filterNameSubmit;
        vm.filterNameSubmitClick = filterNameSubmitClick;
        vm.controlOptions = {
            debounce: 50
        };

        function clearFilterName() {
            vm.filterName = null;
            filterNameSend(null);
        }

        function filterNameSubmit(event, value) {
            if (event.keyCode === 13) {
                filterNameSend(value);
                event.preventDefault();
            }
        }

        function filterNameSend(value) {
            getDecisionMatrix(vm.decision.id, value);
        }

        function filterNameSubmitClick(value) {
            // if (!value) return;
            // TODO: first request if ng-touched
            filterNameSend(value);
        }
        // End Filter name

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

            DecisionDataService.getCriteriaGroupsById(parent.id).then(function(result) {
                sendData.sortCriteriaIds = pickCriteriaIds(result);
                DecisionDataService.getDecisionMatrix(parent.id, sendData).then(function(result) {
                    vm.recommendedDecisionsList = filterDecisionList(result.decisionMatrixs);
                    vm.recommendedDecisionsListLoader = false;
                    vm.activeRecommendedTab.total = result.totalDecisionMatrixs;
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
                list.push(item.decision);
            });
            return list;
        }

        vm.addToCompareList = addToCompareList;

        function addToCompareList(decision) {
            DecisionCompareNotificationService.notifyUpdateDecisionCompare(decision);
            decision.isInCompareList = true;
        }

    }
})();