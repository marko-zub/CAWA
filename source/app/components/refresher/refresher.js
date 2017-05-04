(function() {

  'use strict';

  angular.module('app.components')
    .directive('refresher', function() {
      return {
        transclude: true,
        controller: function($scope, $transclude,
          $attrs, $element) {
          var childScope;

          $scope.$watch($attrs.condition, function(value) {
            $element.empty();
            if (childScope) {
              childScope.$destroy();
              childScope = null;
            }

            $transclude(function(clone, newScope) {
              childScope = newScope;
              $element.append(clone);
            });
          });
        }
      };
    });
})();