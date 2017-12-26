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
            getDecisions(compareListStorage);
        }

        function getDecisions(ids) {
            if (_.isEmpty(ids)) {
                vm.compareLoader = false;
                return;
            }
            // TODO: clean code
            // Dirty code to limit 15 parent calls
            var getDecisionsParentsArray = [];

            if (ids.length > 30) ids.length = 30;
            _.each(ids, function(id) {
                getDecisionsParentsArray.push(getParentDecisionGroups(id));
            });

            // Divide request to chunks
            $q.all(getDecisionsParentsArray).then(function() {
                vm.compareLoader = false;
            });
        }

        function getParentDecisionGroups(id) {
            var params = {
                fetchParentDecisionGroups: true,
                fetchMedia: true
            };

            return DecisionDataService.getDecisionInfoFull(id, params).then(function(resp) {
                // console.log(resp);
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

            var decisionItem = _.pick(decision, 'name', 'id', 'nameSlug', 'logoUrl', 'medias');

            decisionItem = DecisionsUtils.prepareDecisionSingleToUI(decisionItem, false);

            _.each(ownerDecisions, function(ownerDecision) {

                var index = _.findIndex(vm.ownerDecisions, function(vmOwnerDecision) {
                    return ownerDecision.id === vmOwnerDecision.id;
                });

                if (index >= 0) {
                    vm.ownerDecisions[index].decisionsList.push(decisionItem);
                    // vm.ownerDecisions[index] = _.merge(vm.ownerDecisions[index], ownerDecision);
                } else {
                    ownerDecision.decisionsList = [decisionItem];
                    vm.ownerDecisions.push(ownerDecision);
                }
            });

            vm.selectedOwnerDecision = vm.ownerDecisions[0];
        }
        vm.selectOwmerDecision = selectOwmerDecision;

        function selectOwmerDecision(index) {
            vm.selectedOwnerDecision = vm.ownerDecisions[index];
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
            // vm.ownerDecisions
            _.each(vm.ownerDecisions, function(ownerDecision, index) {
                var findIndex = _.findIndex(ownerDecision.decisionsList, function(decision) {
                    return decision.id === id;
                });
                if (findIndex >= 0) {
                    removeDecision = ownerDecision.decisionsList[findIndex];
                    ownerDecision.decisionsList.splice(findIndex, 1);
                }

                if (!ownerDecision.decisionsList.length) {
                    vm.ownerDecisions.splice(index, 1);
                }
            });

            var findIndexDecision = _.indexOf(includeChildDecisionIds, id);
            // debugger
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

            // // if state !== 'decisions.single.categories.comparison'
            DecisionSharedService.filterObject.includeChildDecisionIds = includeChildDecisionIds;
            DecisionSharedService.filterObject.excludeChildDecisionIds = null;

            DecisionNotificationService.notifyChangeDecisionMatrixMode({
                mode: 'exclusion',
                ids: includeChildDecisionIds
            });
            // if ($state.current.name === 'decisions.single.categories.comparison') {
            //     // DecisionNotificationService.notifyChildDecisionExclusion(_fo);
            //     // debugger
            // }

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