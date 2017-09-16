(function() {

    'use strict';

    angular
        .module('app.directives')
        .directive('dwPopover', dwPopover);

    dwPopover.$inject = ['$timeout'];

    function dwPopover($timeout) {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link($scope, $el, $attrs) {

            // TODO: avoid set timeout
            $timeout(function() {

                // Create poper js
                var reference = $el[0];
                var popper = document.getElementById($attrs.dwPopoverId);
                // console.log(popper)
                new Popper(reference, popper, {
                    placement: 'left-start'
                });

                // Popover Hover on content
                var popoverId = $('#' + $attrs.dwPopoverId);
                var isPopoverHover = false;
                $($el).on('mouseenter', function() {
                    if (!isPopoverHover) {
                        popoverId.addClass('in');
                    }
                });
                $($el).on('mouseleave', function() {
                    $timeout(function() {
                        if (!isPopoverHover) {
                            popoverId.removeClass('in');
                        }
                    }, 150);
                });

                popoverId.on('mouseenter', function() {
                    isPopoverHover = true;
                });
                popoverId.on('mouseleave', function() {
                    popoverId.removeClass('in');
                    isPopoverHover = false;
                });

            }, 0);
        }
    }

})();