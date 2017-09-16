(function() {

    'use strict';

    angular
        .module('app.directives')
        .directive('dwScrollBar', dwScrollBar);

    dwScrollBar.$inject = [];

    function dwScrollBar() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link($scope, $el, $attrs) {

            var children = $($el).children();
            // console.log(children.prop('offsetHeight'), children.prop('offsetHeight') > $el[0].clientHeight);
            if (children.prop('offsetHeight') > $el[0].clientHeight) {
                // console.log($el[0].offsetHeight, $el[0].clientHeight);
                var wrapper = $el[0];
                scroll = new IScroll(wrapper, {
                    scrollbars: true,
                    scrollX: false,
                    scrollY: true,
                    mouseWheel: true,
                    interactiveScrollbars: true,
                    // shrinkScrollbars: 'scale',
                    fadeScrollbars: false,
                    // probeType: 3,
                    useTransition: false,
                    // bindToWrapper: true,
                    disablePointer: true,
                    disableTouch: true,
                    bounce: false,
                    momentum: false,
                    disableMouse: false
                });
            }


            // if ($el[0].offsetHeight > $el[0].clientHeight) {
            //     console.log($el);
            // }
        }
    }

})();