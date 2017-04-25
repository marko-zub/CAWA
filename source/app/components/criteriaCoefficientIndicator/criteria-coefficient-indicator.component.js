(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CriteriaCoefficientIndicatorController', CriteriaCoefficientIndicatorController)
        .component('criteriaCoefficientIndicator', {
            templateUrl: 'app/components/criteriaCoefficientIndicator/criteria-coefficient-indicator.html',
            bindings: {
                coefficient: '<'
            },
            controller: 'CriteriaCoefficientIndicatorController',
            controllerAs: 'vm'
        });


    CriteriaCoefficientIndicatorController.$inject = ['$element', '$scope', 'DecisionCriteriaCoefficientsConstant', '$compile'];

    function CriteriaCoefficientIndicatorController($element, $scope, DecisionCriteriaCoefficientsConstant, $compile) {
        var vm = this,
            prevCoef;

        vm.$doCheck = doCheck;
        vm.$onInit = onInit;

        function setCoefficientIndicator(coefficient) {
            if (!coefficient) return;

            // set color of indicator
            _.map(vm.coefficientList, function(c) {
                c.class = '';
                if (c.value <= coefficient.value) {
                    c.class = coefficient.name.toLowerCase();
                }
            });
            // renderComponent();
        }

        function onInit() {
            if (!vm.coefficient) {
                vm.coefficient = DecisionCriteriaCoefficientsConstant.COEFFICIENT_DEFAULT;
            }
            vm.coefficientList = angular.copy(DecisionCriteriaCoefficientsConstant.COEFFICIENT_LIST);
            prevCoef = angular.copy(vm.coefficient);
            setCoefficientIndicator(vm.coefficient);
        }

        function doCheck() {
            if (!angular.equals(vm.coefficient, prevCoef)) {
                handleChange();
                prevCoef = angular.copy(vm.coefficient);
            }
        }

        function handleChange() {
            setCoefficientIndicator(vm.coefficient);
        }

        // function renderComponent(vm.coefficientList) {
        //     var content = _.map(vm.coefficientList, function(coefficient) {
        //         return '<div class="criteria-coefficient-item" ng-class="' + coefficient.class + '"></div>';
        //     }).join('\n');

        //     var renderContent = [
        //         '<div class="criteria-coefficient-indicator">',
        //         content,
        //         '</div>'
        //     ].join('\n');


        //     $element.html(renderContent);
        //     $compile($element.contents())($scope);
        // }


    }
})();