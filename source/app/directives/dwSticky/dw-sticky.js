(function() {

    'use strict';

    angular
        .module('app.directives')
        .directive('dwSticky', dwSticky);

    dwSticky.$inject = [];

    function dwSticky() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        // TODO: add offset attr
        function link($scope, $el) {
            var waypoint;

            // TODO: avoid timeout
            setTimeout(function() {
                waypoint = new Waypoint({ // jshint ignore:line
                    element: $el[0],
                    handler: function(direction) {
                        if (direction === 'down') {
                            $el.addClass('sticky');
                        } else if (direction === 'up') {
                            $el.removeClass('sticky');
                        }
                    },
                    offset: $('#app-header').outerHeight()
                });
            }, 200);

            $scope.$on('$destroy', function() {
                waypoint.destroy();
            });
        }
    }

})();