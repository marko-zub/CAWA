(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartController', HistoryChartController)
        .component('historyChart', {
            bindings: {
                valueId: '<',
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
            // console.log(vm.valueId);
        }

        vm.getData = getData;

        function getData($event) {
            // console.log(vm.valueId);
            if (!vm.valueId) {
                return;
            }

            DecisionDataService.getCharacteristicValueHistory(vm.valueId).then(function(resp) {
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