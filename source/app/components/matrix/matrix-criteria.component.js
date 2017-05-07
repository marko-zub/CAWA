(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCriteriaController', MatrixCriteriaController)
        .component('matrixCriteria', {
            bindings: {
                list: '<'
            },
            controller: 'MatrixCriteriaController',
            controllerAs: 'vm',

        });


    // renderTemplate.$inject = [];

    // function renderTemplate() {
    //     return [
    //         '<div class="matrix-g matrix-g-criteria" ng-repeat="group in vm.list track by group.criterionGroupId">',
    //             '<div class="matrix-item matrix-g-item matrix-item-content">',
    //             '</div>',
    //             '<div class="matrix-row" ng-repeat="item in group.criteria track by item.criterionId" ng-class="{\'hide\': group.isClosed}">',
    //                 '<div class="matrix-col matrix-criteria-group" ng-repeat="decisionCol in item.decisionsRow track by decisionCol.uuid" ng-click="vm.getComments($event)">',
    //                     '<div class="matrix-col-content">',
    //                         '<div ng-switch="decisionCol.criteria.totalVotes > 0">',
    //                             '<div ng-switch-when="true">',
    //                                 '<rating-star class="text-left" item="decisionCol.criteria"></rating-star>',
    //                             '</div>',
    //                             '<div ng-switch-when="false">',
    //                                 '<div class="app-rating-votes">',
    //                                     '<span><span class="glyphicon glyphicon-thumbs-up"></span>0</span>',
    //                                 '</div>',
    //                             '</div>',
    //                         '</div>',
    //                         '<div class="app-item-additional-wrapper">',
    //                             '<a class="app-item-comments link-secondary" ui-sref="decisions.single.matrix.child.option({discussionId: decisionCol.decision.decisionId, discussionSlug: decisionCol.decision.nameSlug, critOrCharId: item.criterionId, critOrCharSlug: item.nameSlug })">',
    //                                 '<span class="glyphicon glyphicon-comment"></span>0',
    //                             '</a>',
    //                         '</div>',
    //                     '</div>',
    //                 '</div>',
    //             '</div>',
    //         '</div>',
    //     ].join('\n');
    // }


    MatrixCriteriaController.$inject = ['DiscussionsNotificationService', '$element', '$compile', '$scope'];

    function MatrixCriteriaController(DiscussionsNotificationService, $element, $compile, $scope) {
        var vm = this;

        // Discussions
        vm.getComments = getComments;


        vm.$onChanges = onChanges;
        function onChanges(changes) {
            if(vm.list) renderMatrix(vm.list);
        }

        function renderMatrix(list) {

            var html =_.map(list, function(group) {

                var items = _.map(group.criteria, function(criteria) {

                    var decisions = _.map(criteria.decisionsRow, function(decisionCol) {
                        // console.log(decisionCol);
                        var rating = decisionCol.criteria.weight ? '<rating-star class="text-left" weight="'+decisionCol.criteria.weight+'" total-votes="'+decisionCol.criteria.totalVotes+'"></rating-star>': '';
                        return [
                            '<div class="matrix-col matrix-criteria-group" id="'+ group.criterionGroupId + '-' +decisionCol.decision.decisionId+'" ng-click="vm.getComments($event)">',
                                '<div class="matrix-col-content">',
                                    rating,
                                    // '<div class="app-rating-votes">',
                                    //     '<span><span class="glyphicon glyphicon-thumbs-up"></span>0</span>',
                                    // '</div>',
                                    '<div class="app-item-additional-wrapper">',
                                        '<a class="app-item-comments link-secondary" ui-sref="decisions.single.matrix.child.option({discussionId: decisionCol.decision.decisionId, discussionSlug: decisionCol.decision.nameSlug, critOrCharId: item.criterionId, critOrCharSlug: item.nameSlug })">',
                                            '<span class="glyphicon glyphicon-comment"></span>0',
                                        '</a>',
                                    '</div>',
                                '</div>',
                            '</div>',
                        ].join('\n');
                    }).join('\n');

                    return [
                        '<div class="matrix-item matrix-item-content">',
                            '<div class="matrix-row">',
                                decisions,
                            '</div>',
                        '</div>',
                    ].join('\n');
                }).join('\n');

                return [
                    '<div class="matrix-g matrix-g-characteristic" id="' + group.criterionGroupId + '">',
                        '<div class="matrix-item matrix-g-item matrix-item-content">',
                        '</div>',
                        items,
                    '</div>'
                ].join('\n');
            }).join('\n');

            // console.log(html.join('\n'));
            // return html;
            renderHtml(html);
        }   

        function renderHtml(html) {
            $element.html(html);
            $compile($element.contents())($scope);
        }

        function getComments($event) {
            vm.isGetCommentsOpen = true;
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();