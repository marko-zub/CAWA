(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCriteriaController', MatrixCriteriaController)
        .component('matrixCriteria', {
            bindings: {
                decisions: '<',
                criteria: '<'
            },
            controller: 'MatrixCriteriaController',
            controllerAs: 'vm',
        });


    MatrixCriteriaController.$inject = ['DiscussionsNotificationService', '$element', '$scope', '$compile', 'translateFilter'];

    function MatrixCriteriaController(DiscussionsNotificationService, $element, $scope, $compile, translateFilter) {
        var vm = this;
        // Discussions
        vm.getComments = getComments;
        vm.$onChanges = onChanges;

        function onChanges(changes) {
            // TODO: check for performance
            // Also compare current and prev changes

            if (changes.decisions && changes.decisions.currentValue) {
                // if first changes and not changed size of decision
                // Generate base html
                if (!changes.decisions.previousValue ||
                    changes.decisions.currentValue.length !== changes.decisions.previousValue.length) {

                    // TODO: crop only size
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
            '   <a href="#" translate-cloak class="sm-link">{{ "RATE IT" | translate }}</a>',
            '   <span class="app-rating-votes-likes"><span class="glyphicon glyphicon-thumbs-up"></span>0</span>',
            '</div>',
        ].join('\n');

        var emptyCol = [
            '<div class="rating">',
            ratingEmptyHtml,
            '</div>',
            '<div class="dw-additional-wrapper dw-comments">',
            '   <a class="control" href="#">',
            '       <span class="glyphicon glyphicon-comment"></span>0',
            '   </a>',
            '</div>',
            '<span class="app-rating-votes-likes control">',
            '   <i class="app-icon glyphicon glyphicon-thumbs-up"></i>',
            '   <span class="app-rating-votes-likes-count">0</span>',
            '</span>'
        ].join('\n');

        function generateCriteriaMatrix(decisions) {
            // TODO: do we need clear all cells html?
            // Empty criterion?!
            $($element).find('.m-group-col').html(emptyCol);
            _.each(decisions, function(decision, decisionIndex) {
                _.each(decision.criteria, function(criteria) {
                    var id = '#m-criteria-' + decisionIndex + '-' + criteria.id;
                    var rating = '<rating-star class="text-left" weight="' + criteria.weight + '" total-votes="' + criteria.totalVotes + '" popover-placement="bottom" popover-append-to-body="true" popover-animation="false" uib-popover="Average vote ' + _.floor(criteria.weight, 2).toFixed(2) + ' out of 5" popover-trigger="\'mouseenter\'"></rating-star>';
                    // rating += '<span class="app-rating-votes-likes control"><i class="app-icon glyphicon glyphicon-thumbs-up"></i>' + criteria.totalVotes + '</span>';
                    $(id).find('.rating').html(rating);
                    $(id).find('.app-rating-votes-likes-count').html(criteria.totalVotes);
                });
            });

            $compile($element.contents())($scope);
        }

        function generateDecisionsRow(decisions, id) {
            var html = [];
            _.each(decisions, function(decision, decisionIndex) {
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

            _.each(list, function(container) {
                // Rows
                var rows = [];
                _.each(container.criteria, function(row) {
                    var currentHstyle;
                    var currentH = $('#m-criteria-group-' + container.id + '-' + row.id).css('height');
                    if (!currentH) {
                        var asideRowH = $('[data-aside=m-criteria-group-' + row.id + ']').outerHeight();
                        currentH = asideRowH + 'px';
                    }
                    currentHstyle = 'height: ' + currentH + '; ';

                    var decisionsRow = generateDecisionsRow(vm.decisions, row.id);
                    var rowBlock = [
                        '<div class="m-group-row" id="m-criteria-group-' + container.id + '-' + row.id + '" style="' + currentHstyle + '">',
                        decisionsRow,
                        '</div>'
                    ].join('\n');
                    rows.push(rowBlock);
                });

                // Check closed panels
                var isClosed = '';
                if ($('#matrix-aside-content [data-criteria-group=' + container.id + '] .matrix-g-title').hasClass('closed')) {
                    isClosed = ' hide';
                }

                // Content block
                var content = [
                    '<div class="m-group js-toggle-hide' + isClosed + '" id="g-criteria-content-' + container.id + '">',
                    rows.join('\n'),
                    '</div>'
                ].join('\n');

                // Group block
                var containerHtml = [
                    '<div data-criteria-group="' + container.id + '" class="m-group" id="g-criteria-' + container.id + '">',
                    '<div class="m-group-title text-center">',
                    translateFilter('Can\'t find the necessary criterion?') + ' <a href="#">' + translateFilter('Add it') + '</a>',
                    '</div>',
                    content,
                    '</div>'
                ].join('\n');

                html.push(containerHtml);
            });
            render(html);

        }

        function render(html) {
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