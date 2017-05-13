(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCriteriaController', MatrixCriteriaController)
        .component('matrixCriteria', {
            // template: renderTemplate,
            bindings: {
                decisions: '<',
                criteria: '<'
            },
            controller: 'MatrixCriteriaController',
            controllerAs: 'vm',
        });

    // renderTemplate.$inject = [];

    // function renderTemplate() {
        // return [
        //     '<div class="matrix-g matrix-g-criteria" ng-repeat="group in vm.listDisplay track by group.criterionGroupId">',
        //         '<div class="matrix-item matrix-g-item matrix-item-content">',
        //         '</div>',
        //         '<div class="matrix-row" ng-repeat="item in group.criteria track by item.criterionId" ng-class="{\'hide\': group.isClosed}">',
        //             '<div class="matrix-col matrix-criteria-group" ng-repeat="decisionCol in item.decisionsRow track by decisionCol.uuid" ng-click="vm.getComments($event)">',
        //                 '<div class="matrix-col-content">',
        //                     '<div ng-switch="::(decisionCol.criteria.totalVotes > 0)">',
        //                         '<div ng-switch-when="true">',
        //                             '<rating-star class="text-left" item="::decisionCol.criteria"></rating-star>',
        //                         '</div>',
        //                         '<div ng-switch-when="false">',
        //                             '<div class="app-rating-votes">',
        //                                 '<span><span class="glyphicon glyphicon-thumbs-up"></span>0</span>',
        //                             '</div>',
        //                         '</div>',
        //                     '</div>',
        //                     '<div class="app-item-additional-wrapper">',
        //                         '<a class="app-item-comments link-secondary">',
        //                             '<span class="glyphicon glyphicon-comment"></span>0',
        //                         '</a>',
        //                     '</div>',
        //                 '</div>',
        //             '</div>',
        //         '</div>',
        //     '</div>',
        // ].join('\n');
    // }

    MatrixCriteriaController.$inject = ['DiscussionsNotificationService', '$element', '$scope', '$compile'];

    function MatrixCriteriaController(DiscussionsNotificationService, $element, $scope, $compile) {
        var vm = this;


        // ui-sref make deep watch 
        // ui-sref="decisions.single.matrix.child.option(::{discussionId: decisionCol.decision.decisionId, discussionSlug: decisionCol.decision.nameSlug, critOrCharId: item.criterionId, critOrCharSlug: item.nameSlug })"
        // Create url in ctrl

        // Discussions
        vm.getComments = getComments;
        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            // vm.listDisplay = angular.copy(vm.decisions);
        }

        function onChanges(changes) {
            // TODO: check for performance
            // Also compare current and prev changes


            if (changes.decisions && changes.decisions.currentValue) {
                // vm.decisions = changes.decisions.currentValue;

                // Render Matrix fist time and whne decisions size changes
                // if (changes.criteria && 
                //     changes.criteria.currentValue) {
                //         generateBaseGrid(changes.criteria.currentValue);
                // }

                // Fill criteria values
                if(vm.criteria &&
                    !angular.equals(changes.decisions.currentValue, changes.decisions.previousValue)) {
                // if(!angular.equals(changes.decisions.currentValue, changes.decisions.previousValue)) {
                    generateBaseGrid(vm.criteria);
                    generateCriteriaMatrix(changes.decisions.currentValue);
                }
            }
            // debugger
            
        }


        var ratingEmptyHtml = [
            '<div class="app-rating-votes">',
                '<span><span class="glyphicon glyphicon-thumbs-up"></span>0</span>',
            '</div>',
        ].join('\n');

        var emptyCol = [
            '<div class="rating">',
                ratingEmptyHtml,
            '</div>',
            '<div class="app-item-additional-wrapper">',
                '<a class="app-item-comments link-secondary" href="#">',
                    '<span class="glyphicon glyphicon-comment"></span>0',
                '</a>',
            '</div>'
        ].join('\n');

        function generateCriteriaMatrix(decisions) {
            // console.log(decisions);
            // Empty criterion?!
            $('.m-group-col').html(emptyCol);
            _.forEach(decisions, function(decision) {
                _.forEach(decision.criteria, function(criteria) {
                    var id = '#m-group-col-' + decision.decision.decisionId + '-' + criteria.criterionId;
                    var rating = rating = '<rating-star class="text-left" weight="' + criteria.weight + '" total-votes="' + criteria.totalVotes + '"></rating-star>';
                    $(id).find('.rating').html(rating);
                    // console.log(id, rating);
                });
            });

            $compile($element.contents())($scope);
        }

        function generateDecisionsRow(decisions, id) {
            var html = [];
            _.forEach(decisions, function(decision, decisionIndex) {
                var col = [
                    '<div class="m-group-col" id="m-group-col-' + decision.decision.decisionId + '-' + id +'" style="left: ' + decisionIndex * 200 + 'px" ng-click="vm.getComments($event)">',
                    '</div>'
                ].join('\n');
                html.push(col);
            });
            // debugger
            return html.join('\n');
        }

        function generateBaseGrid(list) {
            var html = [];
            // console.log(list);
            _.forEach(list, function(container) {
               
               // Rows
               var rows = [];
                _.forEach(container.criteria, function(row, rowIndex) {
                    // console.log(row);
                    var decisionsRow = generateDecisionsRow(vm.decisions, row.criterionId);
                    var rowBlock = [
                        '<div class="m-group-row" id="m-group-row-' + container.criterionGroupId + '-' + row.criterionId + '" style="top: ' + rowIndex *50+ 'px">',
                            decisionsRow,
                        '</div>'
                    ].join('\n');
                    rows.push(rowBlock);
                });

                // Content block
                var content = [
                    '<div class="m-group" id="g-criteria-content-' + container.criterionGroupId + '" style="height: ' + container.criteria.length * 50 +'px">',
                        rows.join('\n'),
                    '</div>'
                ].join('\n');                

                // Group block
                // console.log(container);
                var containerHtml = [
                    '<div class="m-group" id="g-criteria-' + container.criterionGroupId + '">',
                        '<div class="m-group-title">',
                            // container.name,
                        '</div>',
                        content,
                    '</div>'
                ].join('\n');

                html.push(containerHtml);
                // console.log(html);
            });
            render(html);

        }

        function render(html) {
            $element.html(html);
            $compile($element.contents())($scope);            
        }

        function getComments($event) {
            vm.isGetCommentsOpen = true;
            console.log($event);
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();