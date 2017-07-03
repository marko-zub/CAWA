(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('DecisionsListController', DecisionsListController)
        .component('decisionsList', {
            templateUrl: 'app/decisions/decisions-list.html',
            bindings: {
                list: '<',
                criteriaCompliance: '<',
                criteriaComplianceTitle: '@',
                compare: '<'
            },
            controller: 'DecisionsListController',
            controllerAs: 'vm',
        });


    DecisionsListController.$inject = ['DecisionsUtils', 'DecisionCompareNotificationService'];

    function DecisionsListController(DecisionsUtils, DecisionCompareNotificationService) {
        var
            vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;
        var decisionsHeight = 97;
        // TODO: avoid height

        // TODO: break out to recommend list component

        function onInit() {
            if (!vm.list) return;
            vm.decisionsHeight = vm.list.length * decisionsHeight + 'px';
            vm.decisionsList = descriptionTrustHtml(vm.list);
            if(vm.compare !== true) vm.compare = false;
        }

        function onChanges(changes) {
            if (changes.list && changes.list.currentValue &&
                !angular.equals(changes.list.currentValue, changes.list.previousValue)) {
                vm.decisionsHeight = changes.list.currentValue.length * decisionsHeight + 'px';
                vm.decisionsList = DecisionsUtils.descriptionTrustHtml(changes.list.currentValue);
            }
        }

        vm.addToCompareList = addToCompareList;
        function addToCompareList(id) {
            DecisionCompareNotificationService.notifyUpdateDecisionCompare(id);
        }

    }
})();