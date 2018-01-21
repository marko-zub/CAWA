(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartController', HistoryChartController)
        .component('historyChart', {
            bindings: {
                decision: '<',
                characteristics: '<',
                selectedValueId: '<'
            },
            controller: 'HistoryChartController',
            controllerAs: 'vm',
            templateUrl: 'app/components/historyChart/history-chart.html'
        });


    HistoryChartController.$inject = ['DecisionDataService', 'Config', '$element', 'DecisionsUtils'];

    function HistoryChartController(DecisionDataService, Config, $element, DecisionsUtils) {

        var vm = this;

        // vm.$onInit = onInit;
        vm.$onChanges = onChanges;
        vm.$onDestroy = onDestroy;
        vm.$postLink = postLink;

        var chartConstainer;
        var chart;

        function onChanges(changes) {
            if (changes.characteristics &&
                changes.characteristics.currentValue &&
                !angular.equals(changes.characteristics.currentValue, changes.characteristics.previousValue)) {
                var characteristics = angular.copy(changes.characteristics.currentValue);

                // Expect that vm.decision exist
                if (vm.decision) {
                    vm.characteristics = DecisionsUtils.mergeCharacteristicsDecisions(vm.decision, characteristics);
                    createChart();
                }
            }
        }

        // function onInit() {}

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
            if (!vm.selectedValueId) {
                vm.characteristicsTabActive = vm.characteristicsTabs[0];
            } else {
                var findValueId = _.findIndex(vm.characteristicsTabs, function(item) {
                    return item.valueId === vm.selectedValueId;
                });
                if (findValueId >= 0) {
                    vm.characteristicsTabActive = vm.characteristicsTabs[findValueId];
                } else {
                    vm.characteristicsTabActive = vm.characteristicsTabs[0];
                }
            }
            getCharacteristicValueHistory(vm.characteristicsTabActive, null, initChart);
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
            // chart.resetZoomButton();

            // Reinit new chart on change tab
            chart.destroy();
            // initChart(vm.characteristicsTabActive);

            getCharacteristicValueHistory(vm.characteristicsTabActive, null, initChart);
        }

        function getCharacteristicValueHistory(characteristic, params, callback) {
            vm.loaderChart = true;
            var id = characteristic.valueId;
            DecisionDataService.getCharacteristicValueHistory(id, params).then(function(resp) {
                // initChart(resp, characteristic);
                if (typeof callback === 'function') {
                    callback(resp, characteristic);
                }
                vm.loaderChart = false;
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

        function setExtremes(e) {
            if (e.dataMin !== e.min || e.dataMax !== e.max) {
                var params = {};

                if (typeof e.max !== 'undefined') {
                    params.endDate = Math.round(e.max);
                }

                if (typeof e.min !== 'undefined') {
                    params.startDate = Math.round(e.min);
                }

                if (e.rangeSelectorButton && e.rangeSelectorButton.type === 'all') {
                    params = null;
                }

                getCharacteristicValueHistory(vm.characteristicsTabActive, params, updateChartData);
            }
        }

        function prepareChartSerieObject(data, characteristic) {
            return {
                name: vm.characteristicsTabActive.name,
                data: prepareChartData(data, characteristic),
                showInLegend: false,
                tooltip: {
                    valueSuffix: characteristic.valueSuffix,
                    valuePrefix: characteristic.valuePrefix
                }
            };
        }

        function updateChartData(data, characteristic) {
            var chartData = prepareChartSerieObject(data, characteristic);
            chart.series[0].update(chartData, true);
            // initChart(data, characteristic);
        }

        function initChart(data, characteristic) {

            if (!chartConstainer) return false;

            chart = new Highcharts.stockChart(chartConstainer, { // jshint ignore:line
                chart: {
                    height: 550,
                    zoomType: 'x',
                },
                legend: {
                    enabled: false,
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
                    selected: 6,
                    enabled: true,
                    inputEnabled: true,
                    allButtonsEnabled: true,
                    buttons: [{
                            type: 'day',
                            count: 1,
                            text: '1d'
                        }, {
                            type: 'week',
                            count: 1,
                            text: '7d'
                        }, {
                            type: 'month',
                            count: 1,
                            text: '1m'
                        },
                        // {
                        //     type: 'month',
                        //     count: 3,
                        //     text: '3m'
                        // }, {
                        //     type: 'year',
                        //     count: 1,
                        //     text: '1y'
                        // }, 
                        // {
                        //     type: 'ytd',
                        //     count: 1,
                        //     text: 'ytd'
                        // }, 
                        {
                            type: 'all',
                            text: 'all'
                        }
                    ],
                },
                yAxis: {
                    labels: {
                        formatter: function() {
                            return formatPriceValue(this.value, characteristic);
                        }
                    }
                },
                xAxis: {
                    events: {
                        afterSetExtremes: function(e) {
                            setExtremes(e);
                        }
                    },
                    minRange: 24 * 3600,
                },
                credits: {
                    text: Config.title,
                    href: Config.baseUrl
                },
                series: [
                    prepareChartSerieObject(data, characteristic)
                ],
                title: false
            });
        }
    }

})();