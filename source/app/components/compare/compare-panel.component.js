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
        var compareList = [];

        function onInit() {
            compareList = []; //Not need to be displayed
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
            compareList = DecisionCompareService.getList();
            getDecisions(compareListStorage);
        }

        function getDecisions(ids) {
            if (_.isEmpty(ids)) {
                vm.compareLoader = false;
                return;
            }

            var getDecisionsParentsArray = [];

            // TODO: clean code
            // Dirty code to limit 15 parent calls
            if (ids.length > 15) ids.length = 15;
            _.each(ids, function(parentDecision) {
                getDecisionsParentsArray.push(getDecisionByParent(parentDecision));
            });

            $q.all(getDecisionsParentsArray).then(function() {
                vm.compareLoader = false;
            });
        }

        function getDecisionByParent(parentDecision) {
            if (parentDecision.id >= 0 && !_.isEmpty(parentDecision.childDecisions)) {

                var params = {
                    fetchDecisionGroups: true
                };

                return DecisionDataService.getDecisionInfoFull(parentDecision.id, params).then(function(respParentDecision) {
                    var sendIds = _.uniq(parentDecision.childDecisions);
                    vm.parentDecisionActive = respParentDecision[0];
                    // console.log(vm.parentDecisionActive);
                    return DecisionDataService.getDecisionsInfo(sendIds.toString()).then(function(respChildDecisions) {
                        respChildDecisions = DecisionsUtils.prepareDecisionToUI(respChildDecisions);
                        _.each(respChildDecisions, function(decision) {
                            decision.parentDecisions = [respParentDecision[0]];
                            addDecisionCompareList(decision);
                        });
                    });
                });
            }
        }

        function clearCompare() {
            compareList = []; //Not need to be displayed
            vm.compareList = [];
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

        function addDecisionCompareList(decision) {
            if (decision.parentDecisions) {
                saveDecisionCompareList(decision);
            } else {
                DecisionDataService.getDecisionParents(decision.id).then(function(decisionParents) {
                    decision.parentDecisions = decisionParents;
                    saveDecisionCompareList(decision);
                });
            }
        }

        function saveDecisionCompareList(decision) {
            var decisionData = angular.copy(decision);
            _.each(decision.parentDecisions, function(parentDecision) {
                var parentDecisionData = _.pick(parentDecision, 'id', 'name', 'nameSlug');

                var indexParentDecision = _.findIndex(vm.compareList, function(compareParentDecision) {
                    return compareParentDecision.id === parentDecisionData.id;
                });
                if (indexParentDecision >= 0) {
                    vm.compareList[indexParentDecision].childDecisions.push(decisionData);
                } else {
                    parentDecisionData.childDecisions = [];
                    parentDecisionData.childDecisions.push(decisionData);
                    vm.compareList.push(parentDecisionData);
                }
            });

            updateCompareList();
        }

        vm.removeDecisionCompare = removeDecisionCompare;

        function removeDecisionCompare(id) {
            vm.compareList = _.filter(vm.compareList, function(parentDecision) {
                var index = _.findIndex(parentDecision.childDecisions, function(decision) {
                    return decision.id === id;
                });
                if (index >= 0) {
                    DecisionCompareNotificationService.notifyRemoveDecisionCompare(parentDecision.childDecisions[index]);
                    parentDecision.childDecisions.splice(index, 1);
                }
                return !_.isEmpty(parentDecision.childDecisions);
            });
            updateCompareList();
        }

        function updateCompareList() {
            var cleanList = filterCompareList(vm.compareList);
            DecisionCompareService.saveList(cleanList);
            vm.total = DecisionCompareService.total();
        }

        function filterCompareList(list) {
            var newList = angular.copy(list);
            return _.map(newList, function(parentDecision) {
                parentDecision.childDecisions = _.map(parentDecision.childDecisions, 'id');
                return _.pick(parentDecision, 'id', 'childDecisions');
            });
        }

        // TODO: simplify name
        vm.changeParentDecisionActiveDecisionGroupsIndex = changeParentDecisionActiveDecisionGroupsIndex;
        function changeParentDecisionActiveDecisionGroupsIndex(index) {
            vm.parentDecisionActiveDecisionGroupsIndex = index;
        }

        vm.compareDecisions = compareDecisions;

        function compareDecisions(index) {
            var parentDecision = vm.compareList[index];

            var cleanList = filterCompareList(vm.compareList);
            var includeChildDecisionIds = cleanList[index].childDecisions;

            // TODO: pick selected vm.parentDecisionActive.decisionGroups[0]
            vm.parentDecisionActiveDecisionGroupsIndex = 0;
            $state.go('decisions.single.categories.comparison', {
                id: parentDecision.id,
                slug: vm.parentDecisionActive.nameSlug,
                analysisId: null,
                categorySlug: vm.parentDecisionActive.decisionGroups[vm.parentDecisionActiveDecisionGroupsIndex].nameSlug, 
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