(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ComparePanelontrollerController', ComparePanelontrollerController)
        .component('comparePanel', {
            templateUrl: 'app/components/compare/compare-panel.html',
            bindings: {
                list: '<'
            },
            controller: 'ComparePanelontrollerController',
            controllerAs: 'vm'
        });

    ComparePanelontrollerController.$inject = ['DecisionCompareService', 'DecisionCompareNotificationService', 'DecisionDataService', 'DecisionsUtils', '$state', 'DecisionSharedService', '$localStorage', '$q', '$rootScope', 'DecisionNotificationService'];

    function ComparePanelontrollerController(DecisionCompareService, DecisionCompareNotificationService, DecisionDataService, DecisionsUtils, $state, DecisionSharedService, $localStorage, $q, $rootScope, DecisionNotificationService) {
        var vm = this;

        // TODO: clean up, Simplify logic
        vm.togglePanel = togglePanel;
        vm.clearCompare = clearCompare;
        vm.$onInit = onInit;
        vm.total = 0;
        vm.activeTab = 0;
        vm.compareLoader = true;
        vm.selectedOwnerDecisionChildIndex = 0;
        vm.selectedOwnerDecisionIndex = 0;

        // TODO: create one displayCompareDecisions list
        // and filter on click to when change owner decision 
        // or change child decision (decision group)
        // and remove from 2 lists 
        //
        // var compareDecisionsList = [];
        // vm.displayCompareDecisionsList = [];

        var compareListStorage = DecisionCompareService.getList() || [];
        var includeChildDecisionIds = [];

        function onInit() {
            initCompareList();

            if ($localStorage.options && $localStorage.options.comparePanel) {
                vm.isPanelOpen = $localStorage.options.comparePanel.isOpen;
            }
        }

        function togglePanel(isOpen) {
            vm.isPanelOpen = _.isBoolean(isOpen) ? isOpen : !vm.isPanelOpen;
            $localStorage.options.comparePanel = {
                isOpen: vm.isPanelOpen
            };
        }

        function initCompareList() {
            includeChildDecisionIds = DecisionCompareService.getList();
            getDecisionsInit(compareListStorage);
        }

        function getDecisionsInit(ids) {
            if (_.isEmpty(ids)) {
                vm.compareLoader = false;
                return;
            }

            var sendIds = ids.join(',');
            vm.compareLoader = true;

            var params = {
                fetchParentDecisionGroups: true,
                fetchMedia: true
            };

            DecisionDataService.getDecisionInfoFull(sendIds, params).then(function(resp) {
                _.each(resp, function(decision) {
                    createParentDecisionGroups(decision);
                    saveDecisionCompareList(decision);
                });
                vm.compareLoader = false;
            });
        }

        function getParentDecisionGroups(id) {
            var params = {
                fetchParentDecisionGroups: true,
                fetchMedia: true
            };

            return DecisionDataService.getDecisionInfoFull(id, params).then(function(resp) {
                var decisionResp = resp[0];
                createParentDecisionGroups(decisionResp);
                saveDecisionCompareList(decisionResp);
                return decisionResp;
            });
        }

        // New staff
        vm.ownerDecisions = [];

        function createParentDecisionGroups(decision) {
            if (!decision.parentDecisionGroups) return;

            var ownerDecisions = _.map(decision.parentDecisionGroups, 'ownerDecision');

            var decisionItem = _.pick(decision, 'name', 'id', 'nameSlug', 'logoUrl', 'medias', 'parentDecisionGroups');

            decisionItem = DecisionsUtils.prepareDecisionSingleToUI(decisionItem, false);

            var decisParentDecisionGroupsIds = _.map(decision.parentDecisionGroups, 'id');

            // TODO: simplify, check performance
            _.each(ownerDecisions, function(ownerDecision) {

                var index = _.findIndex(vm.ownerDecisions, function(vmOwnerDecision) {
                    return ownerDecision.id === vmOwnerDecision.id;
                });

                if (index >= 0) {
                    _.each(vm.ownerDecisions[index].decisionGroups, function(decisionGroup) {
                        if (!decisionGroup.decisionsList) {
                            decisionGroup.decisionsList = [];
                        }
                        if (_.includes(decisParentDecisionGroupsIds, decisionGroup.id)) {
                            decisionGroup.decisionsList.push(decisionItem);
                        } else {
                            _.each(decision.parentDecisionGroups, function(decParentDecisionGroup) {

                                if (decParentDecisionGroup.ownerDecision.id === vm.ownerDecisions[index].id) {

                                    if (vm.ownerDecisions[index].decisionGroups && vm.ownerDecisions[index].decisionGroups.length) {
                                        var findDecParentDecisionGroup = _.findIndex(vm.ownerDecisions[index].decisionGroups, function(indexdecisionGroups) {
                                            return decParentDecisionGroup.id === indexdecisionGroups.id;
                                        });

                                        if (findDecParentDecisionGroup === -1) {
                                            decParentDecisionGroup.decisionsList = [decisionItem];
                                            vm.ownerDecisions[index].decisionGroups.push(decParentDecisionGroup);
                                        }
                                    }
                                }
                            });
                        }
                    });
                } else {
                    ownerDecision.decisionGroups[vm.selectedOwnerDecisionChildIndex].decisionsList = [decisionItem];
                    vm.ownerDecisions.push(ownerDecision);
                }
            });

            vm.selectedOwnerDecision = vm.ownerDecisions[vm.selectedOwnerDecisionIndex];
        }
        vm.selectOwmerDecision = selectOwmerDecision;

        function selectOwmerDecision(index) {
            vm.selectedOwnerDecisionIndex = index;
            vm.selectedOwnerDecision = vm.ownerDecisions[vm.selectedOwnerDecisionIndex];
            vm.selectedOwnerDecisionChildIndex = 0;
        }

        // End new

        function clearCompare() {
            vm.ownerDecisions = [];
            vm.selectedOwnerDecision = null;
            vm.compareListOwnerDecisions = [];
            includeChildDecisionIds = [];
            vm.total = 0;
            DecisionCompareService.clearList();
            DecisionCompareNotificationService.notifyRemoveDecisionCompare(null);
        }

        //Subscribe to notification events
        DecisionCompareNotificationService.subscribeUpdateDecisionCompare(function(event, data) {
            addDecisionCompareList(data);
            vm.togglePanel(true);
        });

        // TODO: clean up code above
        // Include parent decision
        vm.compareList = [];
        vm.compareListOwnerDecisions = [];

        function addDecisionCompareList(decision) {
            getParentDecisionGroups(decision.id);
        }

        function saveDecisionCompareList(decision) {
            var index = _.indexOf(includeChildDecisionIds, decision.id);
            if (index < 0) {
                includeChildDecisionIds.push(decision.id);
            }
            updateCompareList(includeChildDecisionIds);
        }

        vm.removeDecisionCompare = removeDecisionCompare;

        function removeDecisionCompare(id) {
            var removeDecision;
            _.each(vm.ownerDecisions, function(ownerDecision, index) {
                if (ownerDecision && ownerDecision.decisionGroups && ownerDecision.decisionGroups.length) {

                    if (ownerDecision && ownerDecision.decisionGroups) {
                        _.each(ownerDecision.decisionGroups, function(decisionGroup) {

                            if (decisionGroup && decisionGroup.decisionsList) {
                                var findIndex = _.findIndex(decisionGroup.decisionsList, function(decision) {
                                    return decision.id === id;
                                });
                                if (findIndex >= 0) {
                                    removeDecision = decisionGroup.decisionsList[findIndex];
                                    decisionGroup.decisionsList.splice(findIndex, 1);

                                    if (decisionGroup.decisionsList.length === 0) {
                                        vm.ownerDecisions[index].decisionGroups.splice(findIndex, 1);
                                        if (!vm.ownerDecisions[index].decisionGroups) {
                                            vm.changeParentDecisionActiveDecisionGroupsIndex(0);
                                        }
                                    }
                                }
                            }
                        });
                    }

                    if (ownerDecision.decisionGroups.length === 0) {
                        vm.ownerDecisions.splice(index, 1);

                        if (vm.ownerDecisions && vm.ownerDecisions.length) {
                            vm.selectOwmerDecision(0);
                        } else {
                            vm.clearCompare();
                        }
                    }
                }
            });

            var findIndexDecision = _.indexOf(includeChildDecisionIds, id);

            if (findIndexDecision >= 0) {
                includeChildDecisionIds.splice(findIndexDecision, 1);
            }

            DecisionCompareNotificationService.notifyRemoveDecisionCompare(removeDecision);
            updateCompareList(includeChildDecisionIds);
        }

        function updateCompareList(list) {
            var cleanList = _.uniq(list);
            vm.total = cleanList.length;
            DecisionCompareService.saveList(cleanList);
        }

        // TODO: simplify name
        vm.changeParentDecisionActiveDecisionGroupsIndex = changeParentDecisionActiveDecisionGroupsIndex;

        function changeParentDecisionActiveDecisionGroupsIndex(index) {
            vm.selectedOwnerDecisionChildIndex = index;
        }

        vm.compareDecisions = compareDecisions;
        vm.selectedOwnerDecisionChildIndex = 0;

        function compareDecisions() {

            $state.go('decisions.single.categories.comparison', {
                id: vm.selectedOwnerDecision.id,
                slug: vm.selectedOwnerDecision.nameSlug,
                analysisId: null,
                categorySlug: vm.selectedOwnerDecision.decisionGroups[vm.selectedOwnerDecisionChildIndex].nameSlug, //add index
                size: null,
                page: null,
                sort: null,
                decisionId: null
            });

            // if state !== 'decisions.single.categories.comparison'
            DecisionSharedService.filterObject.includeChildDecisionIds = includeChildDecisionIds;
            DecisionSharedService.filterObject.excludeChildDecisionIds = null;

            DecisionNotificationService.notifyChangeDecisionMatrixMode({
                mode: 'exclusion',
                ids: includeChildDecisionIds
            });

            $rootScope.$on('$stateChangeSuccess',
                function() {
                    if ($state.current.name === 'decisions.single.categories.comparison') {
                        // Add notification service for compare panel
                        togglePanel(false);
                    }
                }
            );
        }

        DecisionCompareNotificationService.subscribeToggleCompare(function(event, data) {
            togglePanel(data.isOpen);
        });
    }
})();