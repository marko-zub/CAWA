(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterControlModalController', FilterControlModalController);

    FilterControlModalController.$inject = ['$uibModalInstance', 'item', 'FilterControlsDataService'];

    function FilterControlModalController($uibModalInstance, item, FilterControlsDataService) {
        var vm = this;

        vm.apply = apply;
        vm.close = close;

        init();

        function apply() {
            // vm.selectedOptions = [];
            _.each(vm.item.options, function(option) {
                if (option.selected === true) {
                    vm.selectedOptions.push(option.value);
                }
            });
            var sendObj = {
                'type': 'AllInQuery',
                'characteristicId': vm.item.id,
                'operator': vm.selectedOperatorTrigger === true ? 'OR' : 'AND',
                'value': vm.selectedOptions
            };
            // console.log(vm.selectedOptions, vm.item.id, sendObj);
            FilterControlsDataService.createFilterQuery(sendObj);
            $uibModalInstance.close(vm.selectedOptions);
        }

        function close() {
            $uibModalInstance.dismiss();
        }

        function init() {
            vm.selectedOptions = [];
            vm.item = angular.copy(item);
            vm.item.options = _.sortBy(vm.item.options, 'name');
            vm.filterQuery = '';

            if (!vm.item.selectedOperator || vm.item.selectedOperator === 'OR') {
                vm.selectedOperatorTrigger =  true;
            } else {
                vm.selectedOperatorTrigger = false;
            }
        }
    }
})();