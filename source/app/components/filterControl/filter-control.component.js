(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterControlController', FilterControlController)
        .component('filterControl', {
            // templateUrl: 'app/components/filterControl/filter-control.html',
            bindings: {
                item: '<',
            },
            controller: 'FilterControlController',
            controllerAs: 'vm'
        });

    FilterControlController.$inject = ['$element', '$compile', '$scope'];

    function FilterControlController($element, $compile, $scope) {
        var
            vm = this;

        vm.$onChanges = onChanges;

        // init();

        function init() {
            console.log(vm.item.valueType, vm.item);
            vm.item = _.pick(vm.item, 'valueType', 'visualMode', 'filterable');
            var html = '<span class="link-secondary" uib-popover="' + vm.item + '" popover-placement="right" popover-append-to-body="true" popover-trigger="\'outsideClick\'" tabindex="0"><i class="glyphicon glyphicon-filter"></i></span>';
            $element.html(html);
            $compile($element.contents())($scope);            
        }

        function onChanges() {
            init();
        }

    }
})();