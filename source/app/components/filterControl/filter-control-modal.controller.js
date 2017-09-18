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
            $uibModalInstance.close();
        }

        function close() {
            $uibModalInstance.dismiss();
        }

        function init() {
            vm.item = item;
        }
    }
})();