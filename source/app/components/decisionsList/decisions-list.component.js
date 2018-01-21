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
                className: '<',
                scrollToId: '<'
            },
            controller: 'DecisionsListController',
            controllerAs: 'vm',
        });


    DecisionsListController.$inject = ['DecisionsUtils', 'DecisionCompareNotificationService', '$element'];

    function DecisionsListController(DecisionsUtils, DecisionCompareNotificationService, $element) {
        var vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;
        vm.$postLink = postLink;
        var decisionsHeight = 97; // TODO: avoid height
        var scrolled  = false;
        // TODO: break out to recommend list component

        function onInit() {
            if (!vm.list) return;
            vm.decisionsHeight = vm.list.length * decisionsHeight + 'px';
            if (vm.compare !== true) vm.compare = false;
            if (!vm.className) vm.className = 'list';
        }

        function onChanges(changes) {
            if (changes.list && changes.list.currentValue &&
                !angular.equals(changes.list.currentValue, changes.list.previousValue)) {
                // vm.decisionsHeight = changes.list.currentValue.length * decisionsHeight + 'px';
                var list = angular.copy(changes.list.currentValue);
                vm.list = DecisionsUtils.prepareDecisionToUI(list);

                handleChanges();
            }
        }

        function handleChanges() {
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
                vm.list = _.map(vm.list, function(decision) {
                    decision.isInCompareList = false;
                    return decision;
                });
                return;
            }

            if (data.id <= 0) return;
            var findIndex = _.findIndex(vm.list, data.id);
            if (findIndex >= 0) {
                vm.list[findIndex].isInCompareList = false;
            }
        });

        function postLink() {
            if (vm.scrollToId) {
                scrollToDecision(vm.scrollToId);
            }
        }

        // TODO: move to decisions list
        function scrollToDecision(id) {
            if (scrolled !== true && !!id && id >= 0) {
                // TODO: avoid set Timeout
                // Move to decision list component
                setTimeout(function() {

                    var decision = $($element).find('#decision-' + id);

                    decision.addClass('animate-highlight');
                    $('html, body').animate({
                        scrollTop: decision.offset().top - 100
                    }, 350);


                }, 0);
            }
            scrolled = true;
        }

    }
})();