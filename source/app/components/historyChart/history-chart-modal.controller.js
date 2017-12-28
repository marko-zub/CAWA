// (function() {

//     'use strict';

//     angular
//         .module('app.components')
//         .controller('HistoryChartModalController', HistoryChartModalController);

//     HistoryChartModalController.$inject = ['$uibModalInstance', 'criteria', 'DecisionCriteriaCoefficientsConstant'];

//     function HistoryChartModalController($uibModalInstance, criteria, DecisionCriteriaCoefficientsConstant) {
//         var vm = this;

//         vm.apply = apply;
//         vm.close = close;

//         init();

//         function apply() {
//             $uibModalInstance.close(vm.criteria);
//         }

//         function close() {
//             $uibModalInstance.dismiss();
//         }

//         function init() {
//             vm.criteria = angular.copy(criteria);
//             vm.coefficientList = DecisionCriteriaCoefficientsConstant.COEFFICIENT_LIST;

//             if (!vm.criteria.coefficient) {
//                 vm.criteria.coefficient = vm.coefficientList[2];
//             }
//         }
//     }
// })();