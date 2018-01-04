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
        vm.$onChanges = onChanges;
        vm.$onDestroy = onDestroy;
        vm.$postLink = postLink;

        var chartConstainer;
        var chart;

        function onChanges(changes) {
            if (changes.characteristics &&
                changes.characteristics.currentValue &&
                !angular.equals(changes.characteristics.currentValue, changes.characteristics.previousValue)) {
                vm.characteristics = angular.copy(changes.characteristics.currentValue);
                onInit();
            }
        }

        function onInit() {
            createChart();
        }

        function onDestroy() {
            if (chart) {
                chart.destroy();
            }
        }

        function postLink() {
            chartConstainer = $($element).find('#decision-chart')[0];
        }

        function createChart() {
            if (vm.characteristics) {
                vm.characteristicsTabs = prepareCharacteristics(vm.characteristics);
                if (vm.characteristicsTabs.length) {
                    initTabs();
                }
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
            getCharacteristicValueHistory(vm.characteristicsTabActive);
        }

        function prepareCharacteristics(list) {
            var newList = [];
            _.each(list, function(item) {
                _.each(item.characteristics, function(characteristic) {
                    if (characteristic.decision && characteristic.decision.totalHistoryValues > 0) {
                        var characteristicPicked = {
                            name: characteristic.name,
                            id: characteristic.id,
                            valueId: characteristic.decision.valueIds[0],
                            description: characteristic.description,
                            primary: characteristic.primary,
                            valuePrefix: characteristic.valuePrefix,
                            valueSuffix: characteristic.valueSuffix
                        };
                        newList.push(characteristicPicked);
                    }
                });
            });

            return _.orderBy(newList, ['primary', true], 'desc');
        }

        vm.changeCharacteristicActive = changeCharacteristicActive;

        function changeCharacteristicActive(index) {
            vm.characteristicsTabActive = vm.characteristicsTabs[index];
            getCharacteristicValueHistory(vm.characteristicsTabActive);
        }

        function getCharacteristicValueHistory(characteristic) {
            vm.loaderChart = true;
            var id = characteristic.valueId;
            DecisionDataService.getCharacteristicValueHistory(id).then(function(resp) {
                vm.loaderChart = false;
                initChart(resp, characteristic);
            });
        }

        function prepareChartData(data) {
            var chartData = [];
            data = _.orderBy(data, 'createDate', 'asc');
            _.each(data, function(item) {
                var value = item.value;
                chartData.push([
                    item.createDate,
                    value
                ]);
            });
            return chartData;
        }

        function formatPriceValue(value, item) {
            value = value.toString();
            if (item.valueSuffix) {
                value = value + ' ' + '<span class="value-suffix">' + item.valueSuffix + '</span>';
            }

            if (item.valuePrefix) {
                value = '<span class="value-prefix">' + item.valuePrefix + '</span> ' + value;
            }
            return value;
        }


        function initChart(data, characteristic) {

            if (!chartConstainer) return false;

            chart = Highcharts.stockChart(chartConstainer, {
                chart: {
                    height: 550,
                    zoomType: 'x',
                },
                legend: {
                    enabled: true,
                    align: 'center',
                    backgroundColor: 'transparent',
                    borderColor: 'black',
                    borderWidth: 0,
                    layout: 'horizontal',
                    verticalAlign: 'bottom',
                    y: 0,
                    shadow: false,
                    floating: false,
                    itemStyle: {
                        color: '#428bca'
                    },
                    itemHoverStyle: {
                        color: '#2a6496'
                    },
                    itemHiddenStyle: {
                        color: '#757575'
                    }
                },

                navigator: {
                    adaptToUpdatedData: false
                },
                scrollbar: {
                    liveRedraw: false
                },
                rangeSelector: {
                    selected: 1,
                    // allButtonsEnabled: true,
                    enabled: true,
                },
                yAxis: {
                    labels: {
                        formatter: function() {
                            return formatPriceValue(this.value, characteristic);
                        }
                    }
                },
                xAxis: {
                    minRange: 24 * 3600 * 1000,
                },
                credits: {
                    text: Config.title,
                    href: Config.baseUrl
                },
                series: [{
                    name: vm.characteristicsTabActive.name,
                    data: prepareChartData(data, characteristic),
                    showInLegend: false,
                    tooltip: {
                        valueSuffix: characteristic.valueSuffix,
                        valuePrefix: characteristic.valuePrefix
                    }
                }],
                title: false
            });
        }
    }

})();