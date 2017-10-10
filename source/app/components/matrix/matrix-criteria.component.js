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

    // TODO: make same object as in matrix-characteristics.component.js
    // renderTemplate.$inject = [];

    // function renderTemplate() {
    // return [
    //     '<div class="matrix-g matrix-g-criteria" ng-repeat="group in vm.listDisplay track by group.id">',
    //         '<div class="matrix-item matrix-g-item matrix-item-content">',
    //         '</div>',
    //         '<div class="matrix-row" ng-repeat="item in group.criteria track by item.id" ng-class="{\'hide\': group.isClosed}">',
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
    //                         '<a class="app-item-comments control">',
    //                             '<span class="glyphicon glyphicon-comment"></span>0',
    //                         '</a>',
    //                     '</div>',
    //                 '</div>',
    //             '</div>',
    //         '</div>',
    //     '</div>',
    // ].join('\n');
    // }

    MatrixCriteriaController.$inject = ['DiscussionsNotificationService', '$element', '$scope', '$compile', 'translateFilter'];

    function MatrixCriteriaController(DiscussionsNotificationService, $element, $scope, $compile, translateFilter) {
        var vm = this;


        // ui-sref make deep watch
        // ui-sref="decisions.single.comparison.child.option(::{discussionId: decisionCol.decision.id, discussionSlug: decisionCol.decision.nameSlug, critOrCharId: item.id, critOrCharSlug: item.nameSlug })"
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
                // if first changes and not changed size of decision
                // Generate base html
                if (!changes.decisions.previousValue ||
                    changes.decisions.currentValue.length !== changes.decisions.previousValue.length) {
                    generateBaseGrid(vm.criteria);
                }
                // Use index to add decision
                // to avoid rerendering all grid all time
                // Fill criteria values
                if (vm.criteria &&
                    !angular.equals(changes.decisions.currentValue, changes.decisions.previousValue)) {
                    generateCriteriaMatrix(changes.decisions.currentValue);
                }
            }
        }


        // TODO: any way faster render?
        var ratingEmptyHtml = [
            '<div class="app-rating-votes">',
            '<a href="#" translate-cloak class="sm-link">{{ "RATE IT" | translate }}</a>',
            '<span class="app-rating-votes-likes"><span class="glyphicon glyphicon-thumbs-up"></span>0</span>',
            '</div>',
        ].join('\n');

        var emptyCol = [
            '<div class="rating">',
            ratingEmptyHtml,
            '</div>',
            '<div class="app-item-additional-wrapper app-item-comments">',
            '<a class="control" href="#">',
            '<span class="glyphicon glyphicon-comment"></span>0',
            '</a>',
            '</div>'
        ].join('\n');

        function generateCriteriaMatrix(decisions) {
            // TODO: do we need clear all cells html?
            // Empty criterion?!
            $($element).find('.m-group-col').html(emptyCol);
            _.forEach(decisions, function(decision, decisionIndex) {
                _.forEach(decision.criteria, function(criteria) {
                    var id = '#m-criteria-' + decisionIndex + '-' + criteria.id;
                    var rating = '<rating-star class="text-left" weight="' + criteria.weight + '" total-votes="' + criteria.totalVotes + '" popover-placement="bottom" popover-append-to-body="true" uib-popover="Average vote ' + _.floor(criteria.weight, 2).toFixed(2) + ' out of 5" popover-trigger="\'mouseenter\'"></rating-star>';
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
                    '<div class="m-group-col" id="m-criteria-' + decisionIndex + '-' + id + '" style="left: ' + decisionIndex * 200 + 'px" ng-click="vm.getComments($event)">',
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
                    var decisionsRow = generateDecisionsRow(vm.decisions, row.id);
                    var rowBlock = [
                        '<div class="m-group-row js-matrix-item-content" id="m-criteria-group-' + container.id + '-' + row.id + '" style="top: ' + rowIndex * 50 + 'px">',
                        decisionsRow,
                        '</div>'
                    ].join('\n');
                    rows.push(rowBlock);
                });

                // Content block
                var content = [
                    '<div class="m-group js-toggle-hide" id="g-criteria-content-' + container.id + '">',
                    rows.join('\n'),
                    '</div>'
                ].join('\n');

                // Group block
                // console.log(container);
                var containerHtml = [
                    '<div data-criteria-group="' + container.id + '" class="m-group" id="g-criteria-' + container.id + '">',
                    '<div class="m-group-title text-center">',
                        translateFilter("Can\'t find the necessary criterion?") + "<a href='#'>" + translateFilter('Add it') + "</a>",
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
            // console.log($event);
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();