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
            '<div class="matrix-g matrix-g-criteria" ng-repeat="group in :refresh2:vm.list track by group.criterionGroupId">',
                '<div class="matrix-item matrix-g-item matrix-item-content">',
                '</div>',
                '<div class="matrix-item matrix-item-content" ng-repeat="item in :refresh2:group.criteria track by item.criterionId" ng-class="{\'hide\': group.isClosed}">',
                    '<div class="matrix-row">',
                        '<div class="matrix-col matrix-criteria-group" ng-repeat="decisionCol in :refresh2:item.decisionsRow track by decisionCol.uuid" ng-click="vm.getComments($event)">',
                            '<div class="matrix-col-content">',
                                '<div ng-switch=":refresh2:decisionCol.criteria.totalVotes > 0">',
                                    '<div ng-switch-when="true">',
                                        '<rating-star class="text-left" item=":refresh2:decisionCol.criteria"></rating-star>',
                                    '</div>',
                                    '<div ng-switch-when="false">',
                                        '<div class="app-rating-votes">',
                                            '<span><span class="glyphicon glyphicon-thumbs-up"></span>0</span>',
                                        '</div>',
                                    '</div>',
                                '</div>',
                                '<div class="app-item-additional-wrapper">',
                                    '<a class="app-item-comments link-secondary" ui-sref="decisions.single.matrix.child.option({discussionId: decisionCol.decision.decisionId, discussionSlug: decisionCol.decision.nameSlug, critOrCharId: item.criterionId, critOrCharSlug: item.nameSlug })">',
                                        '<span class="glyphicon glyphicon-comment"></span>0',
                                    '</a>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
        ].join('\n');
    }

    MatrixCriteriaController.$inject = ['DiscussionsNotificationService', '$scope'];

    function MatrixCriteriaController(DiscussionsNotificationService, $scope) {
        var vm = this;

        // Discussions
        vm.getComments = getComments;
        vm.$onChanges = onChanges;

        function onChanges(changes) {
            $scope.$broadcast('$$rebind::refresh2');
        }

        function getComments($event) {
            vm.isGetCommentsOpen = true;
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();