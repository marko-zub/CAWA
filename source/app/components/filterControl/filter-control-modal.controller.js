(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterControlModalController', FilterControlModalController);

    FilterControlModalController.$inject = ['$uibModalInstance', 'item', 'FilterControlsDataService', 'Utils'];

    function FilterControlModalController($uibModalInstance, item, FilterControlsDataService, Utils) {
        var vm = this;

        vm.apply = apply;
        vm.close = close;

        init();

        var checkedValues;

        function apply() {
            var sendObj = {
                'characteristicId': vm.item.id,
                'operator': vm.selectedOperatorTrigger === true ? 'OR' : 'AND',
                'value': checkedValues
            };
            FilterControlsDataService.createFilterQuery(sendObj);
            $uibModalInstance.close(checkedValues);
            onDestroy();
        }

        function close() {
            $uibModalInstance.dismiss('cancel');
            onDestroy();
        }

        function init() {
            vm.selectedOptions = [];
            vm.item = angular.copy(item);
            vm.item.options = _.sortBy(vm.item.options, 'name');
            vm.filterQuery = '';

            if (!vm.item.selectedOperator || vm.item.selectedOperator === 'OR') {
                vm.selectedOperatorTrigger = true;
            } else {
                vm.selectedOperatorTrigger = false;
            }

            checkedValues = [];
            _.each(vm.item.options, function(option) {
                if (option.selected === true) {
                    checkedValues.push(option.value);
                }
            });

            // TODO: avoid setTimeout
            setTimeout(function() {
                toggleSubmitBtn();
            }, 0);
            vm.itemCopy = angular.copy(vm.item);
        }

        vm.searchFilterQuery = searchFilterQuery;

        function searchFilterQuery() {
            var hiddenOptions = _.filter(vm.item.options, function(option) {
                return option.value && option.value.toLowerCase().indexOf(vm.filterQuery.toLowerCase()) >= 0;
            });

            var itemCopy = angular.copy(vm.item);
            itemCopy.options = hiddenOptions;
            vm.itemCopy = itemCopy;
        }

        // TODO: remove document
        $(document).on('change', '#filter-control-popup .filter-item-checkbox input.js-checkbox', function() {
            var checkbox,
                value;
            checkbox = $(this);
            value = checkbox.val();
            if (checkbox.is(':checked')) {
                Utils.addItemToArray(value, checkedValues);
            } else {
                Utils.removeItemFromArray(value, checkedValues);
            }
            toggleSubmitBtn();
        });

        function toggleSubmitBtn() {
            if (checkedValues.length >= 1) {
                $('#filter-control-popup button[type="submit"]').prop('disabled', false);
            } else {
                $('#filter-control-popup button[type="submit"]').prop('disabled', true);
            }            
        }

        function onDestroy () {
            checkedValues = [];
            $(document).off('change', '#filter-control-popup .filter-item-checkbox input.js-checkbox');
        }

    }
})();