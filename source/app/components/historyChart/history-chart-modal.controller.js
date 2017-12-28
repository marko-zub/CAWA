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

		var options = {
			chart: {
				type: 'lineChart',
				width: 590,
				height: 400,
				// margin: {
				// 	top: 20,
				// 	right: 20,
				// 	bottom: 60,
				// 	left: 55
				// },
				scaleExtent: [1, 10],
				x: function(d) {
					return d.x;
				},
				y: function(d) {
					return d.y;
				},
				transitionDuration: 500,
				useInteractiveGuideline: true,
				xAxis: {
					axisLabel: 'Dates',
					tickFormat: function(d) {
						return d3.time.format('%m/%d/%y')(new Date(d))
					},
					showMaxMin: false,
					staggerLabels: true
				},
				yAxis: {
					axisLabel: 'values',
				}
			}
		};

		vm.options = options;
		vm.data = prepareChartData(data);
		// console.log(vm.data);

		function init() {
			// vm.data = data;
			// console.log(data);
		}

		function prepareChartData(data) {
			var values = [];
			var subscribers = [];
			var ids = [];
			_.each(data, function(item) {
				var chartItem = {
					x: item.createDate,
					y: item.value
				};
				values.push(chartItem);
				subscribers.push({
					x: item.createDate,
					y: item.totalSubscribers
				});

				// ids.push({
				// 	x: item.createDate,
				// 	y: item.id
				// });
			});

			var chartData = [{
				values: values,
				key: 'Value',
				color: '#1f77b4'
			}, 
			// {
			// 	values: subscribers,
			// 	key: 'Subscribers',
			// 	color: '#ff7f0e'
			// },
			// {
			// 	values: ids,
			// 	key: 'ID for test',
			// 	color: '#2ca02c'
			// }
			];

			return chartData;
		}
	}
})();