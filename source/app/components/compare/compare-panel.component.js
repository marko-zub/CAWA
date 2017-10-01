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

    ComparePanelontrollerController.$inject = ['DecisionCompareService', 'DecisionCompareNotificationService', 'DecisionDataService', 'DecisionsUtils'];

    function ComparePanelontrollerController(DecisionCompareService, DecisionCompareNotificationService, DecisionDataService, DecisionsUtils) {
        var
            vm = this;

        vm.isPanelOpen = false;
        vm.togglePanel = togglePanel;
        vm.clearCompare = clearCompare;
        vm.$onInit = onInit;
        vm.decisions = [];
        var compareList = [];

        function onInit() {
            compareList = []; //Not need to be displayed
            initCompareList();
        }


        function togglePanel() {
            vm.isPanelOpen = !vm.isPanelOpen;
        }

        function initCompareList() {
            compareList = DecisionCompareService.getList();
            getDecisions(compareList);
        }

        function getDecisions(ids) {
            if (_.isEmpty(ids)) return;

            var sendIds = _.uniq(ids);
            DecisionDataService.getDecisionsInfo(sendIds.toString()).then(function(result) {
               vm.decisions = DecisionsUtils.prepareDecisionToUI(result);
               vm.isPanelOpen = true;
            });
        }

        function clearCompare() {
            // vm.isPanelOpen = false;
            compareList = []; //Not need to be displayed
            vm.decisions = [];
            DecisionCompareService.clearList();
        }

        //Subscribe to notification events
        DecisionCompareNotificationService.subscribeUpdateDecisionCompare(function(event, data) {
            addDecisionCompareList(data);
            // var parentId = data.parentDecision.id;
            var id = data.id;
            DecisionCompareService.addItem(id);
            vm.decisions.push(data);
            if (compareList.length > 0) vm.isPanelOpen = true;
        });

        function getDecision(id) {
            return DecisionDataService.getDecisionsInfo(id, false);
        }

        vm.removeFromCompareList = removeFromCompareList;

        function removeFromCompareList(id) {
            DecisionCompareService.removeItem(id);
            compareList = DecisionCompareService.getList();

            var findIndex = _.findIndex(vm.decisions, function(decision){
                return decision.id === id;
            });
            if (findIndex >= 0) {
                DecisionCompareNotificationService.notifyRemoveDecisionCompare(vm.decisions[findIndex]);
                vm.decisions.splice(findIndex, 1);
            }
        }

        // TODO: clean up code above
        // Include parent decision
        vm.compareList = [];
        function addDecisionCompareList(decision) {
            console.log(decision);
            var decisionData = _.pick(decision, 'id', 'name', 'nameSlug');

            // TODO: if decision has not parent need to make request
            if (decision.parentDecisions) {
                _.each(decision.parentDecisions, function (parentDecision) {
                    var parentDecisionData = _.pick(parentDecision, 'id', 'name', 'nameSlug');

                    var indexParentDecision = _.findIndex(vm.compareList, function (compareParentDecision) {
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
            }
            console.log(vm.compareList);
        }

        vm.removeDecisionCompare = removeDecisionCompare;
        function removeDecisionCompare(id) {
            // var index = _.findIndex(vm.compareList, function (decision) {
            //     return decision.id = id;
            // });
            // if (index) {

            // }
        }
    }
})();