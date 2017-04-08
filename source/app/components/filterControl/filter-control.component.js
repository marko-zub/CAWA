(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterControlController', FilterControlController)
        .component('filterControl', {
            // templateUrl: 'app/components/contentFormater/content-formater.html',
            bindings: {
                item: '<',
            },
            controller: 'FilterControlController',
            controllerAs: 'vm'
        });

    FilterControlController.$inject = ['$element'];

    function FilterControlController($element, $sce, $compile, $scope) {
        var
            vm = this;

        vm.$onChanges = onChanges;

        // init();

        function init() {
            // vm.item = _.pick(vm.item, 'valueType', 'visualMode', 'filterable')
            // console.log(vm.item.valueType, vm.item);
        }

        function onChanges() {
            init();
        }

    }
})();