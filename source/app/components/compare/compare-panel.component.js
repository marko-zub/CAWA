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

    ComparePanelontrollerController.$inject = ['DecisionCompareService', 'DecisionCompareNotificationService', 'DecisionDataService'];

    function ComparePanelontrollerController(DecisionCompareService, DecisionCompareNotificationService, DecisionDataService) {
        var
            vm = this;

        vm.isPanelOpen = false;
        vm.togglePanel = togglePanel;
        vm.clearCompare = clearCompare;
        vm.$onInit = onInit;


        vm.decisions = [];


        function onInit() {
            vm.compareList = []; //Not need to be displayed
            // TODO: get decision matrix
            initCompareList();
        }


        function togglePanel() {
            vm.isPanelOpen = !vm.isPanelOpen;
        }

        function initCompareList() {
            vm.compareList = DecisionCompareService.getList();
            getDecisions(vm.compareList);
        }

        function getDecisions(ids) {
            if (_.isEmpty(ids)) return;

            var sendData = {
                includeCharacteristicIds: [-1],
                includeChildDecisionIds: _.uniq(ids)
            };
            // vm.isPanelOpen = true;

            // console.log(sendData);
            // DecisionDataService.getDecisions(sendData).then(function(result) {
            //     console.log(result);
            //     vm.decisions = result.decisions;
            // });
        }

        function clearCompare() {
            // vm.isPanelOpen = false;
            vm.compareList = []; //Not need to be displayed
            vm.decisions = [];
            DecisionCompareService.clearList();
        }

        // vm.compareList = [];
        //Subscribe to notification events
        DecisionCompareNotificationService.subscribeUpdateDecisionCompare(function(event, data) {
            var id = data.id;
            DecisionCompareService.addItem(id);

            initCompareList();
            vm.decisions.push(data);
            if (vm.compareList.length > 0) {
                vm.isPanelOpen = true;
            }
        });

        vm.removeFromCompareList = removeFromCompareList;

        function removeFromCompareList(id) {
            DecisionCompareService.removeItem(id);
            vm.compareList = DecisionCompareService.getList();

            var findIndex = _.findIndex(vm.decisions, function(decision){
                return decision.id === id;
            });
            if(findIndex >= 0) {
                vm.decisions.splice(findIndex, 1);
            }
        }

        function getDecision(id) {
            return DecisionDataService.getDecisionInfo(id, false);
        }
    }
})();