(function() {

    'use strict';

    angular
        .module('app.components')
        .directive('matrixScrollBar', dwScrollBar);

    dwScrollBar.$inject = [];

    function dwScrollBar() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link($scope, $el) {
            var martrixScroll;

            var wrapper = $el[0];

            function initScroller() {
                martrixScroll = new IScroll(wrapper, {
                    scrollbars: true,
                    scrollX: true,
                    scrollY: true,
                    mouseWheel: true,
                    interactiveScrollbars: true,
                    shrinkScrollbars: 'scale',
                    fadeScrollbars: false,
                    probeType: 3,
                    useTransition: false,
                    bindToWrapper: true,
                    disablePointer: true,
                    disableTouch: false,
                    // bounce: false,
                    momentum: false,
                    disableMouse: false
                });
                martrixScroll.on('scroll', updatePosition);
            }

            function updatePosition(martrixScroll) {
                var _this = martrixScroll || this; // jshint ignore:line
                scrollHandler(_this.y, _this.x);
                $('.matrix-g .app-control').toggleClass('selected', false);
            }

            // Table scroll
            var 
                tableHeader,
                tableAside;
            tableAside = document.getElementById('matrix-aside-content');
            tableHeader = document.getElementById('matrix-scroll-group');

            function scrollHandler(scrollTop, scrollLeft) {
                tableAside.style.top = scrollTop + 'px';
                tableHeader.style.left = scrollLeft + 'px';
            }

            // function reinitMatrixScroller() {
            //     // TODO: avoid jquery height
            //     if (martrixScroll) {
            //         martrixScroll.refresh();
            //         // updatePosition(martrixScroll);
            //     }
            // }

            initScroller();

        }
    }

})();