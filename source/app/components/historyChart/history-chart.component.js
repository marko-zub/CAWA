(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartController', HistoryChartController)
        .component('historyChart', {
            bindings: {
                decision: '<',
                characteristics: '<',
            },
            controller: 'HistoryChartController',
            controllerAs: 'vm',
            templateUrl: 'app/components/historyChart/history-chart.html'
        });


    HistoryChartController.$inject = ['DecisionDataService', '$uibModal'];

    function HistoryChartController(DecisionDataService, $uibModal) {
        var vm = this;

        vm.$onInit = onInit;
        // vm.$onChanges = onChanges;

        function onInit() {
            // console.log(vm.decision.valueIds[0]);
        }

        vm.getData = getData;

        function getData($event) {
            if (vm.decision.valueIds[0]) {
                openModal($event, vm.decision.valueIds[0]);
            }
        }

        function openModal(event, valueId) {
            var characteristics = vm.characteristics;
            event.preventDefault();
            event.stopPropagation();
            var modalInstance = $uibModal.open({
                templateUrl: 'app/components/historyChart/history-chart-modal.html',
                controller: 'HistoryChartModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                animation: false,
                resolve: {
                    valueId: function() {
                        return valueId;
                    },
                    characteristics: function() {
                        return characteristics;
                    },
                }
            });
            modalInstance.result.then(function(result) {
                vm.decisionsLoader = false;
            });
        }
    }

})();