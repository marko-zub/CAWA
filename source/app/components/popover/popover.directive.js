(function() {

    'use strict';

    angular
        .module('app.components')
        .directive('dwPopover', dwPopover);

    dwPopover.$inject = [];

    function dwPopover() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link($scope, $el, $attrs) {

           // console.log($attrs.dwPopoverId);
           // dw-popover-id
            var reference = document.getElementById($attrs.dwPopoverId);
            var popper = $el[0];
            console.log(reference, popper)
            // new Popper(reference, popper, {
            //     onCreate: (data) => {
            //         // data is an object containing all the informations computed
            //         // by Popper.js and used to style the popper and its arrow
            //         // The complete description is available in Popper.js documentation
            //     },
            //     onUpdate: (data) => {
            //         // same as `onCreate` but called on subsequent updates
            //     }
            // });           
        }
    }

})();