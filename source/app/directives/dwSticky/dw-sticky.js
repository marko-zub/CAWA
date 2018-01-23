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
            var waypoint = new Waypoint({
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
            

            $scope.$on('$destroy', function() {
                waypoint.destroy();
            });
        }
    }

})();