(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CriteriaCoefficientIndicatorController', CriteriaCoefficientIndicatorController)
        .component('criteriaCoefficientIndicator', {
            templateUrl: 'app/components/criteriaCoefficientIndicator/criteria-coefficient-indicator.html',
            bindings: {
                coefficient: '='
            },
            controller: 'CriteriaCoefficientIndicatorController',
            controllerAs: 'vm'
        });


    CriteriaCoefficientIndicatorController.$inject = ['DecisionCriteriaConstant'];

    function CriteriaCoefficientIndicatorController(DecisionCriteriaConstant) {
        var vm = this;

        vm.$doCheck = doCheck;
        vm.$onChanges = onChanges;


        init();

        function setCoefficientIndicator(coefficient) {
            if (!coefficient) return;

            // set color of indicator
            _.map(vm.coefficientList, function(c) {
                c.class = '';
                if (c.value <= coefficient.value) {
                    c.class = coefficient.name.toLowerCase();
                }
            });
        }

        function init() {
            if (!vm.coefficient) {
                vm.coefficient = DecisionCriteriaConstant.COEFFICIENT_DEFAULT;
            }
            vm.coefficientList = angular.copy(DecisionCriteriaConstant.COEFFICIENT_LIST);
        }

        function doCheck() {
            setCoefficientIndicator(vm.coefficient);
        }

        function onChanges() {
            init();
        }
 
    }
})();
