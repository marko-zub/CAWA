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


    HistoryChartController.$inject = ['DecisionDataService', 'Config', '$element'];

    function HistoryChartController(DecisionDataService, Config, $element) {

        var vm = this;
        vm.$onInit = onInit;

        // TODO: add on changes
        vm.$onChanges = onChanges;

        function onChanges(changes) {
            if (!angular.equals(changes.characteristics.currentValue, changes.characteristics.previousValue)) {
                vm.characteristics = angular.copy(changes.characteristics.currentValue);
                onInit();
            }
        }

        function onInit() {
            if (vm.characteristics) {
                vm.characteristicsTabs = prepareCharacteristics(vm.characteristics);
                initTabs();
            }
        }

        function initTabs() {
            if (!vm.decision.valueIds) {
                vm.characteristicsTabActive = vm.characteristicsTabs[0];
            } else {
                var findValueId = _.findIndex(vm.characteristicsTabs, function(item) {
                    return item.valueId === vm.decision.valueIds[0];
                });
                if (findValueId >= 0) {
                    vm.characteristicsTabActive = vm.characteristicsTabs[findValueId];
                } else {
                    vm.characteristicsTabActive = vm.characteristicsTabs[0];
                }
            }

            getCharacteristicValueHistory(vm.characteristicsTabActive.valueId);
        }

        function prepareCharacteristics(list) {
            var newList = [];
            _.each(list, function(item) {
                _.each(item.characteristics, function(characteristic) {

                    if (characteristic.decision && characteristic.decision.totalHistoryValues > 0) {
                        newList.push({
                            name: characteristic.name,
                            id: characteristic.id,
                            valueId: characteristic.decision.valueIds[0],
                            description: characteristic.description
                        });

                    }
                });
            });

            return newList;
        }

        vm.changeCharacteristicActive = changeCharacteristicActive;

        function changeCharacteristicActive(index) {
            vm.characteristicsTabActive = vm.characteristicsTabs[index];
            getCharacteristicValueHistory(vm.characteristicsTabActive.valueId);
        }

        function getCharacteristicValueHistory(id) {
            vm.loaderChart = true;
            DecisionDataService.getCharacteristicValueHistory(id).then(function(resp) {
                vm.loaderChart = false;
                initChart(resp);
            });
        }


        function prepareChartData(data) {

            var chartData = [];
            data = _.orderBy(data, 'createDate', 'asc');
            _.each(data, function(item) {
                chartData.push([
                    item.createDate,
                    item.value
                ]);
            });
            return chartData;
        }


        function initChart(data) {
            var constainer = $($element).find('#decision-chart')[0];

            if (!constainer) return false;

            Highcharts.stockChart(constainer, {
                chart: {
                    height: 550,
                    zoomType: 'x',
                },

                rangeSelector: {
                    selected: 1,
                    // allButtonsEnabled: true,
                    enabled: true,
                },
                xAxis: {
                    minRange: 24 * 3600 * 1000
                },
                credits: {
                    text: Config.title,
                    href: Config.baseUrl
                },
                series: [{
                    name: vm.characteristicsTabActive.name,
                    data: prepareChartData(data),
                    tooltip: {
                        valueDecimals: 2
                    }
                }],
                title: false
            });
        }
    }

})();