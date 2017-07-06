(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ComparePanelontroller', ComparePanelontroller)
        .component('comparePanel', {
            templateUrl: 'app/components/compare/compare-panel.html',
            bindings: {
                list: '<'
            },
            controller: 'ComparePanelontroller',
            controllerAs: 'vm'
        });

    ComparePanelontroller.$inject = ['DecisionCompareService', 'DecisionCompareNotificationService', 'DecisionDataService'];

    function ComparePanelontroller(DecisionCompareService, DecisionCompareNotificationService, DecisionDataService) {
        var
            vm = this;

        vm.isPanelOpen = false;
        vm.togglePanel = togglePanel;
        vm.clearCompare = clearCompare;
        vm.$onInit = onInit;

        vm.compareList = []; //Not need to be displayed
        vm.displayDecisions = [];


        function onInit() {
            // TODO: get decision matrix
            initCompareList();
        }


        function togglePanel() {
            vm.isPanelOpen = !vm.isPanelOpen;
        }

        function initCompareList() {
            vm.compareList = DecisionCompareService.getList();
        }

        function clearCompare() {
            // vm.isPanelOpen = false;
            vm.compareList = []; //Not need to be displayed
            vm.displayDecisions = [];
        }

        // vm.compareList = [];
        //Subscribe to notification events
        DecisionCompareNotificationService.subscribeUpdateDecisionCompare(function(event, data) {
            var id = data.id;
            DecisionCompareService.addItem(id);

            initCompareList();

            // console.log(data);
            vm.displayDecisions.push(data);
            // getDecision(id).then(function(resp) {
            //     console.log(resp);
            // });

            if (vm.compareList.length > 0) {
                vm.isPanelOpen = true;
            }
        });

        vm.removeFromCompareList = removeFromCompareList;

        function removeFromCompareList(id) {
            DecisionCompareService.removeItem(id);
            vm.compareList = DecisionCompareService.getList();

            var findIndex = _.findIndex(vm.displayDecisions, function(decision){
                return decision.id === id;
            });
            if(findIndex >= 0) {
                vm.displayDecisions.splice(findIndex, 1);
            }
        }

        function getDecision(id) {
            return DecisionDataService.getDecisionInfo(id, false);
        }
    }
})();