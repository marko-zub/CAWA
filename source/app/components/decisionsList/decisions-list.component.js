(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('DecisionsListController', DecisionsListController)
        .component('decisionsList', {
            templateUrl: 'app/components/decisionsList/decisions-list.html',
            bindings: {
                list: '<',
                // criteriaCompliance: '<',
                criteriaComplianceTitle: '@',
                compare: '<',
                parentDecision: '<',
                className: '<'
            },
            controller: 'DecisionsListController',
            controllerAs: 'vm',
        });


    DecisionsListController.$inject = ['DecisionsUtils', 'DecisionCompareNotificationService', 'DecisionCompareService'];

    function DecisionsListController(DecisionsUtils, DecisionCompareNotificationService, DecisionCompareService) {
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
            if (vm.compare !== true) vm.compare = false;

            if(!vm.className) vm.className = 'list';
        }

        function pickCompareDeicisions() {
            var compareList = DecisionCompareService.getList();
            vm.list = _.map(vm.list, function(decision) {
                decision.isInCompareList = false;
                if (_.includes(compareList, decision.id)) {
                    decision.isInCompareList = true;
                }
                return decision;
            });
        }

        function onChanges(changes) {
            if (changes.list && changes.list.currentValue &&
                !angular.equals(changes.list.currentValue, changes.list.previousValue)) {
                vm.decisionsHeight = changes.list.currentValue.length * decisionsHeight + 'px';
                vm.decisionsList = DecisionsUtils.prepareDecisionToUI(changes.list.currentValue);

                handleChanges();
            }
        }

        function handleChanges() {
            // console.log(vm.compare);
            if (vm.compare === true) {
                pickCompareDeicisions();
            }
        }

        vm.addToCompareList = addToCompareList;

        function addToCompareList(decision) {
            DecisionCompareNotificationService.notifyUpdateDecisionCompare(decision);
            decision.isInCompareList = true;
        }

    }
})();