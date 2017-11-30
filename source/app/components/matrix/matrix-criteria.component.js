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
            '   <span class="icon-svg-vote"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M501.333 0c-25.11 0-57.024 16.128-66.475 21.205L298.668.363c-19.137 0-65.324 1.237-80.3 12.267L133.035 65.6c-4.053 2.517-5.93 7.403-4.63 11.99 1.324 4.586 5.505 7.743 10.262 7.743h96c.853 0 1.685-.107 2.517-.256l14.293-3.52c9.237-1.344 18.453 1.408 25.472 7.488 7.04 6.08 11.05 14.89 11.05 24.192 0 7.403-2.304 14.464-6.677 20.46l-33.557 46.1c-9.365 14.037-7.51 32.896 4.437 44.843 6.933 6.912 16.02 10.39 25.13 10.39s18.198-3.478 25.132-10.412l54.08-54.08c20.203-1.13 38.677-9.856 52.373-23.936 18.944 17.557 79.573 23.125 91.584 24.043.277.02.555.02.832.02 2.667 0 5.27-1.002 7.232-2.836C510.763 165.8 512 162.964 512 160V10.667C512 4.78 507.22 0 501.334 0zm-85.29 71.296l-12.31 46.7c-10.11 19.348-29.844 31.338-51.732 31.338-2.836 0-5.546 1.11-7.55 3.115l-57.09 57.087c-5.354 5.355-14.72 5.355-20.074 0-4.78-4.757-5.525-12.31-2.027-17.557l33.322-45.74c7.04-9.663 10.752-21.098 10.752-33.044 0-15.467-6.7-30.165-18.39-40.3-9.663-8.362-21.887-12.927-35.028-12.927-2.773 0-5.61.212-8.448.618L233.408 64h-57.344l54.25-33.707c6.678-4.907 36.054-8.597 66.732-8.725l126.528 19.477c-2.07 7.403-4.758 17.856-7.53 30.25zm74.624 76.97c-23.06-2.602-51.392-7.914-63.467-14.634 2.133-20.736 5.888-40.832 9.6-57.43l9.77-37.076c9.857-5.184 28.225-13.61 44.097-16.66v125.8z"/><path d="M405.163 392.917l-21.333-128c-.853-5.14-5.29-8.917-10.517-8.917H320c0-5.888-4.78-10.667-10.667-10.667s-10.667 4.78-10.667 10.667v10.56c0 .043-.02.064-.02.107s.02.064.02.107V320h-192V128H256c5.888 0 10.667-4.78 10.667-10.667s-4.78-10.667-10.667-10.667H96c-5.888 0-10.667 4.78-10.667 10.667V256H32c-5.205 0-9.664 3.776-10.517 8.917l-21.333 128c-.043.277.064.533.043.79-.022.34-.193.618-.193.96v106.667C0 507.22 4.78 512 10.667 512h384c5.888 0 10.667-4.78 10.667-10.667V394.667c0-.363-.17-.683-.213-1.024-.02-.256.085-.49.043-.726zM41.023 277.333h44.31V320H74.667C68.78 320 64 324.78 64 330.667s4.78 10.667 10.667 10.667h256c5.888 0 10.667-4.78 10.667-10.667S336.554 320 330.667 320H320v-42.667h44.288L382.058 384H23.254l17.77-106.667zM384 490.667H21.333v-85.333H384v85.333z"/></svg></span>',
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
                    // rating += '<span class="app-rating-votes-likes control"><span class="icon-svg-vote"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M501.333 0c-25.11 0-57.024 16.128-66.475 21.205L298.668.363c-19.137 0-65.324 1.237-80.3 12.267L133.035 65.6c-4.053 2.517-5.93 7.403-4.63 11.99 1.324 4.586 5.505 7.743 10.262 7.743h96c.853 0 1.685-.107 2.517-.256l14.293-3.52c9.237-1.344 18.453 1.408 25.472 7.488 7.04 6.08 11.05 14.89 11.05 24.192 0 7.403-2.304 14.464-6.677 20.46l-33.557 46.1c-9.365 14.037-7.51 32.896 4.437 44.843 6.933 6.912 16.02 10.39 25.13 10.39s18.198-3.478 25.132-10.412l54.08-54.08c20.203-1.13 38.677-9.856 52.373-23.936 18.944 17.557 79.573 23.125 91.584 24.043.277.02.555.02.832.02 2.667 0 5.27-1.002 7.232-2.836C510.763 165.8 512 162.964 512 160V10.667C512 4.78 507.22 0 501.334 0zm-85.29 71.296l-12.31 46.7c-10.11 19.348-29.844 31.338-51.732 31.338-2.836 0-5.546 1.11-7.55 3.115l-57.09 57.087c-5.354 5.355-14.72 5.355-20.074 0-4.78-4.757-5.525-12.31-2.027-17.557l33.322-45.74c7.04-9.663 10.752-21.098 10.752-33.044 0-15.467-6.7-30.165-18.39-40.3-9.663-8.362-21.887-12.927-35.028-12.927-2.773 0-5.61.212-8.448.618L233.408 64h-57.344l54.25-33.707c6.678-4.907 36.054-8.597 66.732-8.725l126.528 19.477c-2.07 7.403-4.758 17.856-7.53 30.25zm74.624 76.97c-23.06-2.602-51.392-7.914-63.467-14.634 2.133-20.736 5.888-40.832 9.6-57.43l9.77-37.076c9.857-5.184 28.225-13.61 44.097-16.66v125.8z"/><path d="M405.163 392.917l-21.333-128c-.853-5.14-5.29-8.917-10.517-8.917H320c0-5.888-4.78-10.667-10.667-10.667s-10.667 4.78-10.667 10.667v10.56c0 .043-.02.064-.02.107s.02.064.02.107V320h-192V128H256c5.888 0 10.667-4.78 10.667-10.667s-4.78-10.667-10.667-10.667H96c-5.888 0-10.667 4.78-10.667 10.667V256H32c-5.205 0-9.664 3.776-10.517 8.917l-21.333 128c-.043.277.064.533.043.79-.022.34-.193.618-.193.96v106.667C0 507.22 4.78 512 10.667 512h384c5.888 0 10.667-4.78 10.667-10.667V394.667c0-.363-.17-.683-.213-1.024-.02-.256.085-.49.043-.726zM41.023 277.333h44.31V320H74.667C68.78 320 64 324.78 64 330.667s4.78 10.667 10.667 10.667h256c5.888 0 10.667-4.78 10.667-10.667S336.554 320 330.667 320H320v-42.667h44.288L382.058 384H23.254l17.77-106.667zM384 490.667H21.333v-85.333H384v85.333z"/></svg></span>' + criteria.totalVotes + '</span>';
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
                    translateFilter('CRITERIA'),
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