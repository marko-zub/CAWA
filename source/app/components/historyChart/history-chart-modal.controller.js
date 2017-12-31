(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartModalController', HistoryChartModalController);

    HistoryChartModalController.$inject = ['$uibModalInstance', 'DecisionDataService', 'valueId', 'characteristics', 'Config'];

    function HistoryChartModalController($uibModalInstance, DecisionDataService, valueId, characteristics, Config) {
        var vm = this;

        vm.apply = apply;
        vm.close = close;

        init();

        function apply() {
            $uibModalInstance.close(vm.criteria);
        }

        function close() {
            $uibModalInstance.dismiss();
        }

        function init() {
            vm.chartConfig;
            vm.characteristicsTabs = prepareCharacteristics(characteristics);

            var findValueId = _.findIndex(vm.characteristicsTabs, function(item) {
                return item.valueId === valueId;
            })
            if (findValueId >= 0) {
                vm.characteristicsTabActive = vm.characteristicsTabs[findValueId];
            } else {
                vm.characteristicsTabActive = vm.characteristicsTabs[0];
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

            var categories = [];
            var chartData = [];

            data = _.orderBy(data, 'createDate', 'asc');
            _.each(data, function(item, index) {
                chartData.push([
                    item.createDate,
                    item.value
                ]);
            });
            return chartData;
        }


        function initChart(data) {
            var chartDataSeries = prepareChartData(data);
            var data = chartDataSeries;

            Highcharts.stockChart('container', {
                chart: {
                    height: 550,
                },

                rangeSelector: {
                    selected: 1
                },
                credits: {
                    text: Config.title,
                    href: Config.baseUrl
                },
                title: {
                    text: 'AAPL Stock Price'
                },

                series: [{
                    name: 'AAPL',
                    data: data,
                    tooltip: {
                        valueDecimals: 2
                    }
                }],
                title: false
            });


        }
    }
})();