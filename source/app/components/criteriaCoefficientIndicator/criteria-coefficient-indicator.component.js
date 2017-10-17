(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CriteriaCoefficientIndicatorController', CriteriaCoefficientIndicatorController)
        .component('criteriaCoefficientIndicator', {
            // template: renderTemplate,
            bindings: {
                coefficient: '<'
            },
            controller: 'CriteriaCoefficientIndicatorController',
            controllerAs: 'vm',
        });


    CriteriaCoefficientIndicatorController.$inject = ['DecisionCriteriaCoefficientsConstant', '$element', '$compile', '$scope'];

    function CriteriaCoefficientIndicatorController(DecisionCriteriaCoefficientsConstant, $element, $compile, $scope) {
        var vm = this;

        vm.$onChanges = onChanges;
        vm.$onInit = onInit;

        function setCoefficientIndicator(coefficient) {
            if (!coefficient) return;

            // set color of indicator
            _.forEach(vm.coefficientList, function(c) {
                c.class = '';
                if (c.value <= coefficient.value) {
                    c.class = coefficient.name.toLowerCase();
                }
            });
            renderComponent(vm.coefficientList, coefficient);
        }

        function onInit() {
            if (!vm.coefficient) {
                vm.coefficient = DecisionCriteriaCoefficientsConstant.COEFFICIENT_DEFAULT;
            }
            vm.coefficientList = angular.copy(DecisionCriteriaCoefficientsConstant.COEFFICIENT_LIST);
            setCoefficientIndicator(vm.coefficient);
        }

        function onChanges(changes) {
            // console.log(changesObj.coefficient);
            if (!angular.equals(changes.coefficient.currentValue, changes.coefficient.previousValue)) {
                setCoefficientIndicator(vm.coefficient);
            }
        }

        function renderComponent(coefficientList, coefficient) {
            // TODO: optimize loop
            // var content = _(coefficientList).chain().map(function(coefficient) {
            //     return '<div class="criteria-coefficient-item ' + coefficient.class + '"></div>';
            // }).sortBy('value').reverse().value().join('\n');

            // TOOD: move tooltip options to obj
            // Create factory for tooltip?!
            var html = [
            '<div class="criteria-coefficient-indicator-new" uib-tooltip="{{\'FACTOR OF IMPORTANCE\' | translate }}: ' + coefficient.name + '" tooltip-placement="right" tooltip-append-to-body="true" tooltip-class="tooltip-light">',
                '<span class="indicator bg-color-' + coefficient.name + '"></span>',
            '</div>'
            ].join('\n');

            $element.html(html);
            $compile($element.contents())($scope);            
        }
    }
})();