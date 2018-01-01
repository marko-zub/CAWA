(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartBtnController', HistoryChartBtnController)
        .component('historyChartBtn', {
            bindings: {
                decision: '<',
                characteristics: '<',
                title: '<',
            },
            controller: 'HistoryChartBtnController',
            controllerAs: 'vm',
            templateUrl: 'app/components/historyChart/history-chart-btn.html'
        });


    HistoryChartBtnController.$inject = ['$uibModal'];

    function HistoryChartBtnController($uibModal) {
        var vm = this;

        vm.$onInit = onInit;


        function onInit() {
            // console.log(vm.decision.valueIds[0]);
        }

        vm.getData = getData;

        function getData($event) {
            if (vm.decision.valueIds[0]) {
                openModal($event, vm.decision, vm.title);
            }
        }

        function openModal(event, decision, title) {
            var characteristics = vm.characteristics;
            event.preventDefault();
            event.stopPropagation();
            var modalInstance = $uibModal.open({
                templateUrl: 'app/components/historyChart/history-chart-modal.html',
                controller: 'HistoryChartModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                windowClass: 'app-chart-popup',
                animation: false,
                resolve: {
                    decision: function() {
                        return decision;
                    },
                    characteristics: function() {
                        return characteristics;
                    },
                    title: function() {
                        return title;
                    }                    
                }
            });
        }
    }

})();