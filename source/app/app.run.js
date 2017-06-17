(function() {
    'use strict';

    angular
        .module('app')
        .run(runBlock);

    runBlock.$inject = ['$rootScope', '$state', '$location'];

    function runBlock($rootScope, $state, $location) {
        var pageTitle = 'DecisionWanted';
        $rootScope.url = '';

        // Move to service
        $rootScope.decisonViewsCount = true;
        $rootScope.$on('$stateChangeStart', 
            function(event, toState, toParams, fromState, fromParams) {
                if(toState && fromState && toState.name === fromState.name) {
                    $rootScope.decisonViewsCount = false;
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