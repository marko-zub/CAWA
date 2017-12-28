(function() {

	'use strict';

	angular
		.module('app.components')
		.controller('HistoryChartModalController', HistoryChartModalController);

	HistoryChartModalController.$inject = ['$uibModalInstance', 'data'];

	function HistoryChartModalController($uibModalInstance, data) {
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


		var chartConfig = {
			chart: {
				type: 'line'
			},
			series: [{
				data: [10, 15, 12, 8, 7],
				id: 'series1'
			}],
			title: {
				text: 'Hello'
			},
			xAxis: [{
				type: 'datetime'
			}],
			yAxis: [{ // Primary yAxis
				title: {
					text: 'number of notification',
				}
			}, { // Secondary yAxis
				title: {
					text: 'usage time',
				},
				opposite: true
			}],
		};

		vm.chartConfig = chartConfig;
		function init() {
			// console.log(data);
			vm.chartConfig = chartConfig;
		}
	}
})();