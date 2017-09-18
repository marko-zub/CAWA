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
                if (!reference || !popper) {
                    return;
                }

                var popover = new Popper(reference, popper, {
                    placement: 'left'
                });

                // Popover Hover on content
                var popoverId = $('#' + $attrs.dwPopoverId);
                var isPopoverHover = false;
                popoverId.removeClass('hide');
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
                    }, 150, false);
                });

                popoverId.on('mouseenter', function() {
                    isPopoverHover = true;
                });
                popoverId.on('mouseleave', function() {
                    popoverId.removeClass('in');
                    isPopoverHover = false;
                });

                // Update position
                popoverId.on('click', '.app-list-group-title', function () {
                    $timeout(function() {
                        popover.update();
                    }, 300, false);
                });

            }, 0, false);
        }
    }

})();