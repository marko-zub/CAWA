(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterControlModalController', FilterControlModalController);

    FilterControlModalController.$inject = ['$uibModalInstance', 'item'];

    function FilterControlModalController($uibModalInstance, item) {
        var vm = this;

        vm.apply = apply;
        vm.close = close;

        init();

        function apply() {
            // vm.selectedOptions = [];
             _.each(vm.item.options, function (option) {
                if (option.selected === true) {
                   vm.selectedOptions.push(option.value);
                }
            });

            $uibModalInstance.close(vm.selectedOptions);
        }

        function close() {
            $uibModalInstance.dismiss();
        }

        function init() {
            vm.selectedOptions = [];
            vm.item = angular.copy(item);
            vm.filterQuery = '';
        }
    }
})();