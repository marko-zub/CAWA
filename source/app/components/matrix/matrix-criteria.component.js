(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCriteriaController', MatrixCriteriaController)
        .component('matrixCriteria', {
            template: renderTemplate,
            bindings: {
                list: '<'
            },
            controller: 'MatrixCriteriaController',
            controllerAs: 'vm',
        });

    renderTemplate.$inject = [];

    function renderTemplate() {
        return [
            '<div class="matrix-g matrix-g-criteria" ng-repeat="group in vm.listDisplay track by group.criterionGroupId">',
                '<div class="matrix-item matrix-g-item matrix-item-content">',
                '</div>',
                '<div class="matrix-row" ng-repeat="item in group.criteria track by item.criterionId" ng-class="{\'hide\': group.isClosed}">',
                    '<div class="matrix-col matrix-criteria-group" ng-repeat="decisionCol in item.decisionsRow track by decisionCol.uuid" ng-click="vm.getComments($event)">',
                        '<div class="matrix-col-content">',
                            '<div ng-switch="::(decisionCol.criteria.totalVotes > 0)">',
                                '<div ng-switch-when="true">',
                                    '<rating-star class="text-left" item="::decisionCol.criteria"></rating-star>',
                                '</div>',
                                '<div ng-switch-when="false">',
                                    '<div class="app-rating-votes">',
                                        '<span><span class="glyphicon glyphicon-thumbs-up"></span>0</span>',
                                    '</div>',
                                '</div>',
                            '</div>',
                            '<div class="app-item-additional-wrapper">',
                                '<a class="app-item-comments link-secondary" ui-sref="decisions.single.matrix.child.option(::{discussionId: decisionCol.decision.decisionId, discussionSlug: decisionCol.decision.nameSlug, critOrCharId: item.criterionId, critOrCharSlug: item.nameSlug })">',
                                    '<span class="glyphicon glyphicon-comment"></span>0',
                                '</a>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
        ].join('\n');
    }

    MatrixCriteriaController.$inject = ['DiscussionsNotificationService'];

    function MatrixCriteriaController(DiscussionsNotificationService) {
        var vm = this;

        // Discussions
        vm.getComments = getComments;
        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            vm.listDisplay = angular.copy(vm.list);
            // console.log(vm.listDisplay);
        }

        function onChanges (changes) {
            // TODO: check for performance
            // Also compare current and prev changes
            if (changes.list.currentValue &&
                !angular.equals(changes.list.currentValue, changes.list.previousValue)) {
                vm.listDisplay = changes.list.currentValue;
                // console.log(vm.listDisplay);
            }
        }

        function getComments($event) {
            vm.isGetCommentsOpen = true;
            console.log($event);
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();