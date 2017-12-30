(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartModalController', HistoryChartModalController);

    HistoryChartModalController.$inject = ['$uibModalInstance', 'DecisionDataService', 'valueId', 'characteristics'];

    function HistoryChartModalController($uibModalInstance, DecisionDataService, valueId, characteristics) {
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
                            valueId: characteristic.decision.valueIds[0]
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
                var chartItem = {
                    x: item.createDate,
                    y: item.value
                };
                chartData.push(item.value);
                categories.push(item.createDate);
            });

            return [
                categories,
                chartData
            ]
        }


        function initChart(data) {
            var chartDataSeries = prepareChartData(data);
            var categories = chartDataSeries[0];
            var series = chartDataSeries[1];

            var chartConfig = {
                chart: {
                    height: 350,
                    width: 560,
                    type: 'line'
                },
                series: [{
                    name: vm.characteristicsTabActive.name + ' values',
                    data: series,
                    id: 's1',
                    color: '#1f77b4',
                }],
                title: false,

                xAxis: {
                    categories: categories,
                    type: 'datetime',
                    labels: {
                        format: '{value:%d/%m/%Y}',
                    },
                    dateTimeLabelFormats: {
                        day: '%e of %b'
                    },
                },
                yAxis: {
                    title: {
                        text: vm.characteristicsTabActive.name + ' values'
                    },
                    reversedStacks: false,
                }
            };

            vm.chartConfig = chartConfig
        }
    }
})();