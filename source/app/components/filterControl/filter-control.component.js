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

    FilterControlController.$inject = ['$element', '$compile', '$scope', '$uibModal'];

    function FilterControlController($element, $compile, $scope, $uibModal) {
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
                vm.selected = angular.copy(changes.item.currentValue.selectedValue);
            }
        }

        // TODO: make nested switch ?!
        // Find way to move in template function
        // Because need get access to vm in template function
        function chooseValueType(item) {
            if (!item || !item.valueType || !item.visualMode) return;
            item.valueType = item.valueType.toUpperCase();
            item.visualMode = item.visualMode.toUpperCase();
            // console.log(item);
            // TODO: add to swicth
            // console.log(item.name + ' : ' + item.valueType + '  ' + item.visualMode);
            switch (true) {
                case (item.multiValue === true):
                    renderControl('checkbox-group', item);
                    break;
                case (((item.valueType === 'STRING') && (item.visualMode === 'SELECT')) ||
                    ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'SELECT'))):
                    renderControl('select');
                    break;
                case ((item.valueType === 'DATETIME') && (item.visualMode === 'DATERANGEPICKER' || item.visualMode === 'DATETIMERANGEPICKER')):
                    renderControl('date-range');
                    break;
                case ((item.valueType === 'DOUBLE' || item.valueType === 'PRICE') && (item.visualMode === 'DOUBLERANGESLIDER')):
                    renderControl('range-slider');
                    break;
                case ((item.valueType === 'INTEGER') && (item.visualMode === 'INTEGERRANGESLIDER')):
                    renderControl('range-slider');
                    break;
                case (
                    (item.visualMode === 'CHECKBOX') ||
                    ((item.valueType === 'STRINGARRAY') && (item.visualMode === 'LABEL')) ||
                    ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'LABEL'))):
                    if (item.value && !_.isArray(item.value) && !item.options) item.options = [item.value];
                    renderControl('checkbox-group', item);
                    break;
                case ((item.valueType === 'BOOLEAN')):
                    renderControl('radio-group');
                    break;
                default:
                    //Empty
            }
        }

        function renderControl(type, item) {
            if (!type) return;
            var element = '<filter-' + type + ' selected="vm.selected" item="vm.item"></filter-' + type + '>';


            // Modal full options for checkboxes
            if (type === 'checkbox-group' && (item.lazyOptions || _.isArray(item.options) && item.options.length)) {
                element = '<span class="filter-control-full-mode link-secondary" ng-click="vm.filterControlModalOpen(vm.item, vm.selected)"><i class="fa dw-icon-resize-full-alt" aria-hidden="true"></i></span>' + element;
            }

            $element.html(element);
            $compile($element.contents())($scope);
        }

        // Modal
        vm.filterControlModalOpen = filterControlModalOpen;

        function filterControlModalOpen(item, selected) {
            item.options = pickSelectedOptions(item.options, selected);
            $uibModal.open({
                templateUrl: 'app/components/filterControl/filter-control-modal.html',
                controller: 'FilterControlModalController',
                controllerAs: 'vm',
                // backdrop: 'static',
                animation: false,
                resolve: {
                    item: function() {
                        return item;
                    }
                }
            });
        }

        function pickSelectedOptions(options, selectedArray) {
            _.each(selectedArray, function(selected) {
                var index = _.findIndex(options, function(option) {
                    return option.value === selected;
                });

                if (index >= 0) {
                    options[index].selected = true;
                }
            });
            return options;
        }
    }
})();