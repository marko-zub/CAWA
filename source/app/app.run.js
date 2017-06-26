(function() {
    'use strict';

    angular
        .module('app')
        .run(runBlock);

    runBlock.$inject = ['$rootScope', '$state', '$location'];

    function runBlock($rootScope, $state, $location) {
        var pageTitle = 'DecisionWanted';
        $rootScope.url = '';

        // TODO: simplify logic
        // Move to service
        $rootScope.decisonViewsCount = true;
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                if(toState && fromState && toState.name === fromState.name ||
                    (fromState.name.indexOf('decisions.single') >= 0 && toState.name.indexOf('decisions.single') >= 0)) {
                    $rootScope.decisonViewsCount = false;
                } else {
                    $rootScope.decisonViewsCount = true;
                }
        });

        $rootScope.breadcrumbs = true;
        var stateListener = $rootScope.$on('$stateChangeSuccess', function($state, $stateParams) {
            if (angular.isDefined($stateParams.data)) {
                if ($stateParams.data.pageTitle) {
                    $rootScope.pageTitle = $stateParams.data.pageTitle + ' | ' + pageTitle;
                } else {
                    $rootScope.pageTitle = pageTitle;
                }

                $rootScope.breadcrumbs = $stateParams.data.breadcrumbs;
            }

            $rootScope.pageUrl = $location.absUrl();
            // console.log($rootScope.pageUrl);
        });
    }

})();