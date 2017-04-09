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
            if (vm.item.options) {
                // console.log(vm.item.valueType, vm.item);
                vm.item = _.pick(vm.item, 'valueType', 'visualMode', 'filterable', 'options');
                // var html = '<span class="link-secondary" uib-popover="' + vm.item + '" popover-placement="right" popover-append-to-body="true" popover-trigger="\'outsideClick\'" tabindex="0"><i class="glyphicon glyphicon-filter"></i></span>';

                var html = '<div class="filter-item">';

                // console.log(vm.item.options);
                _.map(vm.item.options, function(option) {
                    html += '<div class="filter-item-checkbox"><input type="checkbox" id="option-' + option.characteristicOptionId + '" name="option-' + option.characteristicOptionId + '" value="' + option.value + '"> ';
                    html += '<label for="option-' + option.characteristicOptionId + '">'+option.name+'</label>';
                    html += '</div>';
                });
                html += '</div>';

                $element.html(html);
                $compile($element.contents())($scope);
            }
        }

        function onChanges() {
            init();
        }

    }
})();