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

    ComparePanelontroller.$inject = ['DecisionCompareService', 'DecisionCompareNotificationService'];

    function ComparePanelontroller(DecisionCompareService, DecisionCompareNotificationService) {
        var
            vm = this;


        vm.isPanelOpen = false;
        vm.togglePanel = togglePanel;

        function togglePanel() {
            vm.isPanelOpen = !vm.isPanelOpen;
        }

        vm.compareList = [];
        //Subscribe to notification events
        DecisionCompareNotificationService.subscribeUpdateDecisionCompare(function(event, data) {
            DecisionCompareService.addItem(data);
            vm.compareList = DecisionCompareService.getList();
        });

        vm.removeFromCompareList = removeFromCompareList;

        function removeFromCompareList(id) {
            DecisionCompareService.removeItem(id);
            vm.compareList = DecisionCompareService.getList();
        }
    }
})();