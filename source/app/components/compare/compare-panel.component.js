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

    ComparePanelontrollerController.$inject = ['DecisionCompareService', 'DecisionCompareNotificationService', 'DecisionDataService', 'DecisionsUtils', '$state', 'DecisionSharedService', '$localStorage'];

    function ComparePanelontrollerController(DecisionCompareService, DecisionCompareNotificationService, DecisionDataService, DecisionsUtils, $state, DecisionSharedService, $localStorage) {
        var
            vm = this;

        // TODO: clean up, Simplify logic
        vm.isPanelOpen = false;
        vm.togglePanel = togglePanel;
        vm.clearCompare = clearCompare;
        vm.$onInit = onInit;
        vm.total = 0;
        vm.activeTab = 0;

        var compareListStorage = DecisionCompareService.getList() || [];
        var compareList = [];

        function onInit() {
            compareList = []; //Not need to be displayed
            initCompareList();

            if ($localStorage.options && !_.isEmpty($localStorage.options.comparePanel)) {
                vm.isPanelOpen = $localStorage.options.comparePanel.isOpen;
            }
        }


        function togglePanel() {
            vm.isPanelOpen = !vm.isPanelOpen;
            var comparenPanelOptions = {
                comparePanel: {
                    isOpen: vm.isPanelOpen
                }
            };
            $localStorage.options = comparenPanelOptions;
        }

        function initCompareList() {
            compareList = DecisionCompareService.getList();
            getDecisions(compareListStorage);
        }

        function getDecisions(ids) {
            if (_.isEmpty(ids)) return;
            _.each(ids, function(parentDecision) {
                getParentDecision(parentDecision);
            });
        }

        function getParentDecision(parentDecision) {
            if (parentDecision.id >= 0 && !_.isEmpty(parentDecision.childDecisions)) {
                DecisionDataService.getDecisionsInfo(parentDecision.id).then(function(respParentDecision) {
                    var sendIds = _.uniq(parentDecision.childDecisions);
                    DecisionDataService.getDecisionsInfo(sendIds.toString()).then(function(respChildDecisions) {

                        respChildDecisions = DecisionsUtils.prepareDecisionToUI(respChildDecisions);
                        _.each(respChildDecisions, function(decision) {
                            decision.parentDecisions = [respParentDecision[0]];
                            addDecisionCompareList(decision);
                        });
                        // console.log(respChildDecisions);
                        vm.isPanelOpen = true;
                    });
                });
            }
        }

        function clearCompare() {
            // vm.isPanelOpen = false;
            compareList = []; //Not need to be displayed
            vm.compareList = [];
            vm.total = 0;
            DecisionCompareService.clearList();
            DecisionCompareNotificationService.notifyRemoveDecisionCompare(null);
        }

        //Subscribe to notification events
        DecisionCompareNotificationService.subscribeUpdateDecisionCompare(function(event, data) {
            addDecisionCompareList(data);
            var id = data.id;
            if (compareList.length > 0) vm.isPanelOpen = true;
        });

        function getDecision(id) {
            return DecisionDataService.getDecisionsInfo(id, false);
        }

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
            var decisionData = angular.copy(decision); //_.pick(decision, 'id', 'name', 'nameSlug');
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
            if (vm.total === 1) {
                vm.isPanelOpen = true;
            }
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

        vm.compareDecisions = compareDecisions;

        function compareDecisions(index) {
            var parentDecision = vm.compareList[index];

            var cleanList = filterCompareList(vm.compareList);
            var includeChildDecisionIds = cleanList[index].childDecisions;

            DecisionSharedService.filterObject.includeChildDecisionIds = includeChildDecisionIds;
            $state.go('decisions.single.comparison', {id: parentDecision.id, slug: parentDecision.nameSlug}, {reload: true});
        }
    }
})();