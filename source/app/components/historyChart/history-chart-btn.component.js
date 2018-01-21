(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartBtnController', HistoryChartBtnController)
        .component('historyChartBtn', {
            bindings: {
                decision: '<',
                characteristics: '<',
                selectedCharacteristicId: '<',
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
            var find = _.find(vm.decision.characteristics, function(characteristic) {
                return vm.selectedCharacteristicId === characteristic.id;
            });
            vm.totalHistoryValues = find.totalHistoryValues;
            vm.selectedValueId = find.valueIds[0];

            if (vm.decision && vm.decision.decision) {
                vm.title = vm.decision.decision.name + ' Charts';
            }
        }

        vm.getData = getData;

        function getData($event) {
            openModal($event, vm.decision, vm.title);
        }

        function openModal(event, decision, title) {

            var characteristics = vm.characteristics;
            // console.log(vm.characteristics);

            event.preventDefault();
            event.stopPropagation();
            // var modalInstance = 
            $uibModal.open({
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
                    },
                    selectedValueId: function() {
                        return vm.selectedValueId;
                    }
                }
            });
        }
    }

})();