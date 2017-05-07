(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterControlController', FilterControlController)
        .component('filterControl', {
            bindings: {
                item: '<',
            },
            controller: 'FilterControlController',
            controllerAs: 'vm'
        });



    FilterControlController.$inject = ['$element', '$compile', '$scope'];

    function FilterControlController($element, $compile, $scope) {
        var vm = this;

        vm.$onInit = onInit;


        function onInit() {
            chooseValueType(vm.item);
        }

        // TODO: make nested switch ?!
        function chooseValueType(item) {
            if (!item || !item.valueType || !item.visualMode) return;
            item.valueType = item.valueType.toUpperCase();
            item.visualMode = item.visualMode.toUpperCase();

            switch (true) {
                case ((item.valueType === 'STRING') && (item.visualMode === 'SELECT')):
                    renderHtml('<filter-select item="::vm.item"></filter-select>');
                    break;
                case ((item.valueType === 'DATETIME') && (item.visualMode === 'DATERANGEPICKER')):
                    renderHtml('<filter-date-range item="::vm.item"></filter-date-range>');
                    break;
                case ((item.valueType === 'INTEGER') && (item.visualMode === 'INTEGERRANGESLIDER')):
                    renderHtml('<filter-range-slider item="::vm.item"></filter-range-slider>');
                    break;
                case ((item.valueType === 'STRINGARRAY') && (item.visualMode === 'LABEL')):
                    renderHtml('<filter-checkbox-group item="::vm.item"></filter-checkbox-group>');
                    break;
                case ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'LABEL')):
                    renderHtml('<filter-checkbox-group item="::vm.item"></filter-checkbox-group>');
                    break;
                case ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'SELECT')):
                    renderHtml('<filter-select item="::vm.item"></filter-select>');
                    break;
                case ((item.valueType === 'BOOLEAN') && (item.visualMode === 'RADIOGROUP')):
                    renderHtml('<filter-radio-group item="::vm.item"></filter-radio-group>');
                    break;
                default:
                    //Empty
            }
        }

        function renderHtml(html) {
            $element.html(html);
            $compile($element.contents())($scope);
        }
    }
})();