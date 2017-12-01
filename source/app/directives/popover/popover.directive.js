(function() {

    'use strict';

    angular
        .module('app.directives')
        .directive('dwPopover', dwPopover);

    dwPopover.$inject = ['$timeout', '$compile'];

    function dwPopover($timeout, $compile) {
        var directive = {
            restrict: 'A',
            link: link,
            scope: {
                decision: '=',
                parentDecision: '=',
            }
        };

        return directive;

        function link($scope, $el, $attrs) {

            var isPopoverCompiled = false;
            var popover;
            var popoverContentId;
            var isPopoverHover = false;

            var htmlPopover = [
                // '<div>{{decision}}</div>',
                '<div class="poper-wrapper">',
                '    <div id="criteria-{{::decision.id}}" class="poper hide criteria-popover text-left">',
                '        <div class="arrow popper__arrow" x-arrow></div>',
                '        <div class="popover-content popover-inner">',
                '            <criteria-compliance-popover decision="decision" parent-decision="::parentDecision"></criteria-compliance-popover>',
                '        </div>',
                '    </div>',
                '</div>'
            ].join('\n');

            // TODO: avoid set timeout
            // $timeout(function() {
            $el.on('mouseenter', function() {
                if (!isPopoverCompiled) {
                    compilePopover();
                }
            });

            function compilePopover() {
                $el.append(htmlPopover);
                $compile($el.find('.poper-wrapper').contents())($scope);
                isPopoverCompiled = true;
                $timeout(function() {
                    initPopover();

                    // Show first time
                    popoverContentId = $('#' + $attrs.dwPopoverId);
                    popoverContentId.removeClass('hide');
                    popoverContentId.addClass('in');

                    initEvents();
                }, 0, false);
            }

            function initPopover() {
                // Create poper js
                var reference = $el[0];
                var popper = document.getElementById($attrs.dwPopoverId);

                popover = new Popper(reference, popper, {
                    placement: $attrs.dwPopoverDirection || 'left',
                    modifiers: {
                        preventOverflow: {
                            // enabled: true,
                            boundariesElement: document.body,
                        }
                    }
                });

                // Compile popover on first hover
                $el.on('mouseenter', function() {
                    if (!isPopoverCompiled) {
                        $el.append(htmlPopover);
                        $compile($el.contents())($scope);
                        isPopoverCompiled = true;
                    }
                });
            }

            function initEvents() {
                // TODO: avoid set timeout
                // Minimize code for 
                // Popover Hover on content

                // TODO: bad case with dependency to '.popover-ref'
                $el.find('.popover-ref').on('mouseenter', function() {
                    if (!isPopoverHover) {
                        $('.poper').not(popoverContentId).removeClass('in');
                        popoverContentId.addClass('in');
                    }
                });

                $el.find('.popover-ref').on('mouseleave', function() {
                    $timeout(function() {
                        if (!isPopoverHover) {
                            popoverContentId.removeClass('in');
                        }
                    }, 60, false);
                });

                popoverContentId.on('mouseenter', function() {
                    isPopoverHover = true;
                });
                popoverContentId.on('mouseleave', function() {
                    popoverContentId.removeClass('in');
                    isPopoverHover = false;
                });
            }
        }
    }

})();