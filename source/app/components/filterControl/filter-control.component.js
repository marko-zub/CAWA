(function() {
    'use strict';
    angular.module('app.components')
        .controller('FilterControlController', FilterControlController)
        .component('filterControl', {
            bindings: {
                item: '<'
            },
            controller: 'FilterControlController',
            controllerAs: 'vm'
        });



    FilterControlController.$inject = ['$element', '$compile', '$scope'];

    function FilterControlController($element, $compile, $scope) {
        var vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            var itemCopy = angular.copy(vm.item);
            var cleanItem = _.omit(itemCopy, 'createDate', 'description', 'nameSlug');
            chooseValueType(cleanItem);
        }

        function onChanges(changes) {
            // TODO: optimize it
            // Check only item need to remove vm.selected
            if (changes.item && changes.item.currentValue &&
                !angular.equals(changes.item.currentValue, changes.item.previousValue)) {
                vm.selected = changes.item.currentValue.selectedValue;
            }
        }

        // TODO: make nested switch ?!
        // Find way to move in template function
        // Because need get access to vm in template function
        function chooseValueType(item) {
            if (!item || !item.valueType || !item.visualMode) return;
            item.valueType = item.valueType.toUpperCase();
            item.visualMode = item.visualMode.toUpperCase();
            console.log(item);
            // TODO: add to swicth
            if (item.multiValue === true) {
                renderControl('checkbox-group');
                return;                                 
            }


            switch (true) {
                // TODO:
                // in swicth item.multivalue equals 'undefined'
                // case ((item.multivalue === true)):
                //     renderControl('checkbox-group');
                //     console.log(item);
                //     break;
                case (((item.valueType === 'STRING') && (item.visualMode === 'SELECT')) ||
                    ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'SELECT'))):
                    renderControl('select');
                    break;
                case ((item.valueType === 'DATETIME') && (item.visualMode === 'DATERANGEPICKER')):
                    renderControl('date-range');
                    break;
                case ((item.valueType === 'DOUBLE') && (item.visualMode === 'DOUBLERANGESLIDER')):
                    renderControl('range-slider');
                    break;
                case ((item.valueType === 'INTEGER') && (item.visualMode === 'INTEGERRANGESLIDER')):
                    renderControl('range-slider');
                    break;
                case (
                    // (item.value && !_.isArray(item.value)) ||
                    (item.visualMode === 'CHECKBOX') ||
                    ((item.valueType === 'STRINGARRAY') && (item.visualMode === 'LABEL')) ||
                    ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'LABEL'))):
                    if(item.value && !_.isArray(item.value) && !item.options) item.options = [item.value];
                    renderControl('checkbox-group');
                    break;
                case ((item.valueType === 'BOOLEAN')):
                // case ((item.valueType === 'BOOLEAN') && (item.visualMode === 'RADIOGROUP')):
                    renderControl('radio-group');
                    break;
                default:
                    //Empty
            }
        }

        function renderControl(type) {
            if (!type) return;
            var element = '<filter-' + type + ' selected="vm.selected" item="vm.item"></filter-' + type + '>';
            $element.html(element);
            $compile($element.contents())($scope);
        }
    }
})();