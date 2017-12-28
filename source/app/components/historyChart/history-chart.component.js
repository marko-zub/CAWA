(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartController', HistoryChartController)
        .component('historyChart', {
            bindings: {
                decision: '<',
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
            // console.log(vm.decision.valueIds[0]);
            if (!vm.decision.valueIds[0]) {
                return;
            }

            DecisionDataService.getCharacteristicValueHistory(vm.decision.valueIds[0]).then(function(resp) {
                if (resp.length) {
                    openModal($event, resp);
                }
            })
        }

        function openModal(event, data) {
            event.preventDefault();
            event.stopPropagation();
            var modalInstance = $uibModal.open({
                templateUrl: 'app/components/historyChart/history-chart-modal.html',
                controller: 'HistoryChartModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                animation: false,
                resolve: {
                    data: function() {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function(result) {
                vm.decisionsLoader = false;
            });
        }
    }

})();