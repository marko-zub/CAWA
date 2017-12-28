(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartController', HistoryChartController)
        .component('historyChart', {
            bindings: {
                characteristicId: '<',
            },
            controller: 'HistoryChartController',
            controllerAs: 'vm',
            templateUrl: 'app/components/historyСhart/history-chart.html',
        });


    HistoryChartController.$inject = [];

    function HistoryChartController() {
        var vm = this;

        vm.$onInit = onInit;
        // vm.$onChanges = onChanges;

        function onInit() {
            console.log('init');
        }

        vm.openModal = openModal;

        function openModal(event, criteria) {
            console.log(vm.id);
            // event.preventDefault();
            // event.stopPropagation();
            // var modalInstance = $uibModal.open({
            //     templateUrl: 'app/components/history-chart/history-chart-modal.html',
            //     controller: 'ChartModalController',
            //     controllerAs: 'vm',
            //     backdrop: 'static',
            //     animation: false,
            //     resolve: {
            //         criteria: function() {
            //             return criteria;
            //         }
            //     }
            // });
            // modalInstance.result.then(function(result) {
            //     vm.decisionsLoader = false;
            // });
        }
    }

})();