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
                criteriaList: '<',
                criteriaGroupsList: '<',
                compare: '<',
                parentDecision: '<',
                className: '<'
            },
            controller: 'DecisionsListController',
            controllerAs: 'vm',
        });


    DecisionsListController.$inject = ['DecisionsUtils', 'DecisionCompareNotificationService', 'DecisionCompareService', '$templateRequest', '$compile', '$interpolate', '$templateCache', '$scope'];

    function DecisionsListController(DecisionsUtils, DecisionCompareNotificationService, DecisionCompareService, $templateRequest, $compile, $interpolate, $templateCache, $scope) {
        var
            vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;
        var decisionsHeight = 97; // TODO: avoid height

        // TODO: break out to recommend list component

        function onInit() {
            if (!vm.list) return;
            vm.decisionsHeight = vm.list.length * decisionsHeight + 'px';
            vm.decisionsList = vm.list;
            if (vm.compare !== true) vm.compare = false;
            if (!vm.className) vm.className = 'list';
        }

        function pickCompareDeicisions() {
            var compareList = DecisionCompareService.getList();

            vm.list = _.map(vm.list, function(decision) {
                decision.isInCompareList = false;

                _.each(compareList, function(parentDecision) {
                    if (_.includes(parentDecision.childDecisions, decision.id)) {
                        decision.isInCompareList = true;
                    }
                });

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
            if (vm.criteriaList === true) {
                _.forEach(vm.list, function(decision, index) {
                    // decision
                    vm.list[index].criteriaGroups = DecisionsUtils.mergeCriteriaDecision(decision.criteria, vm.criteriaGroupsList) || {};
                    vm.list[index].criteriaGroups.totalVotes = _.sumBy(decision.criteria, 'totalVotes');
                });
            }
        }

        //Subscribe to notification events
        DecisionCompareNotificationService.subscribeRemoveDecisionCompare(function(event, data) {
            if (_.isNull(data)) {
                vm.list =_.map(vm.list, function (decision) {
                    decision.isInCompareList = false;
                    return decision;
                });
                return;
            }

            if (data.id <= 0) return;
            var findIndex = _.findIndex(vm.list, function(decision) {
                return decision.id === data.id;
            });
            if (findIndex >= 0) {
                vm.list[findIndex].isInCompareList = false;
            }
        });

    }
})();