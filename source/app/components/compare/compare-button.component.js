(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CompareButtonController', CompareButtonController)
        .component('compareButton', {
            templateUrl: 'app/components/compare/compare-button.html',
            bindings: {
                decision: '<',
                parentDecision: '<'
            },
            controller: 'CompareButtonController',
            controllerAs: 'vm'
        });

    CompareButtonController.$inject = ['DecisionCompareNotificationService', '$scope', 'DecisionCompareService'];

    function CompareButtonController(DecisionCompareNotificationService, $scope, DecisionCompareService) {
        var vm = this;

        vm.addToCompareList = addToCompareList;
        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            checkInCompareDeicisions(vm.decision);
        }

        function onChanges(changes) {
            if (changes.decision &&
                !angular.equals(changes.decision.currentValue, changes.decision.previousValue)) {
                vm.decision = angular.copy(changes.decision.currentValue);
            }
        }

        function addToCompareList(decision) {
            if (!_.isEmpty(vm.parentDecision)) decision.parentDecisions = [vm.parentDecision];
            DecisionCompareNotificationService.notifyUpdateDecisionCompare(decision);
            decision.isInCompareList = true;
        }

        // TODO: find other way
        // Avoid $scope
        $scope.$on('removeDecisionCompareList', function(event, data) {
            if (_.isNull(data) || data && data.id === vm.decision.id) {
                vm.decision.isInCompareList = false;
            }
        });

        function checkInCompareDeicisions(decision) {
            var compareList = DecisionCompareService.getList();
            _.each(compareList, function(parentDecision) {
                if (_.includes(parentDecision.childDecisions, decision.id)) {
                    decision.isInCompareList = true;
                }
            });
        }

    }
})();