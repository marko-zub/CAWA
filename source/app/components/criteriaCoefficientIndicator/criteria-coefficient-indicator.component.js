(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CriteriaCoefficientIndicatorController', CriteriaCoefficientIndicatorController)
        .component('criteriaCoefficientIndicator', {
            // templateUrl: 'app/components/criteriaCoefficientIndicator/criteria-coefficient-indicator.html',
            bindings: {
                coefficient: '<'
            },
            controller: 'CriteriaCoefficientIndicatorController',
            controllerAs: 'vm',
            template: renderTemplate
        });


    renderTemplate.$inject = ['$element', '$attrs'];
    
    function renderTemplate($element, $attrs) {
        return '<div ng-bind-html="vm.html" class="criteria-coefficient-indicator"></div>';
    }

    CriteriaCoefficientIndicatorController.$inject = ['$element', '$scope', 'DecisionCriteriaCoefficientsConstant', '$compile'];

    function CriteriaCoefficientIndicatorController($element, $scope, DecisionCriteriaCoefficientsConstant, $compile) {
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
            renderComponent(vm.coefficientList);
        }

        function onInit() {
            if (!vm.coefficient) {
                vm.coefficient = DecisionCriteriaCoefficientsConstant.COEFFICIENT_DEFAULT;
            }
            vm.coefficientList = angular.copy(DecisionCriteriaCoefficientsConstant.COEFFICIENT_LIST);
            setCoefficientIndicator(vm.coefficient);
        }

        function onChanges(changesObj) {
            // console.log(changesObj.coefficient);
            // if (!angular.equals(vm.coefficient, changesObj.coefficient.currentValue)) {
                setCoefficientIndicator(vm.coefficient);
            // }
        }

        function renderComponent(coefficientList) {
            // TODO: optimize loop
            var html = _(coefficientList).chain().map(function(coefficient) {
                return '<div class="criteria-coefficient-item ' + coefficient.class + '"></div>';
            }).sortBy('value').reverse().value().join('\n');

            vm.html = html;
        }


    }
})();