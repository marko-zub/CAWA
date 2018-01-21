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
                title: '<'
            },
            controller: 'HistoryChartBtnController',
            controllerAs: 'vm',
            templateUrl: 'app/components/historyChart/history-chart-btn.html'
        });


    HistoryChartBtnController.$inject = ['$uibModal', '$sce'];

    function HistoryChartBtnController($uibModal, $sce) {
        var vm = this;

        vm.$onInit = onInit;


        function onInit() {
            var find = _.find(vm.decision.characteristics, function (characteristic) {
                return vm.selectedCharacteristicId === characteristic.id;
            });
            vm.totalHistoryValues = find.totalHistoryValues;
            vm.selectedValueId = find.valueIds[0];
        }

        vm.getData = getData;

        function getData($event) {
            openModal($event, vm.decision, vm.title);
        }

        function openModal(event, decision, title) {
            var characteristics = _.map(vm.characteristics, function(group) {
                group.characteristics = _.map(group.characteristics, function(characteristic) {
                                        console.log(characteristic.description);
                    characteristic.description = characteristic.description && !_.isObject(characteristic.description) ? $sce.trustAsHtml(characteristic.description) : '';
                    return characteristic;
                });
                return group;
            });

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
                    selectedValueId: function () {
                        return vm.selectedValueId;
                    }
                }
            });
        }
    }

})();