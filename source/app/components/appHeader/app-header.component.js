(function() {

	'use strict';

	angular
		.module('app.components')
		.controller('HeaderController', HeaderController)
		.component('appHeader', {
			templateUrl: 'app/components/appHeader/app-header.html',
			controller: 'HeaderController',
			controllerAs: 'vm'
		});

	HeaderController.$inject = ['$state', '$stateParams', '$rootScope', '$location'];

	function HeaderController($state, $stateParams, $rootScope, $location) {
		var vm = this;

		// TODO:
		// Move to app.run.js
        // Page title
        var pageTitle = 'DecisionWanted';
        $rootScope.url = '';
        $rootScope.pageTitle = pageTitle;
        $rootScope.breadcrumbs = true;
        var stateListener = $rootScope.$on('$stateChangeSuccess', function($state, $stateParams) {
            if (angular.isDefined($stateParams.data)) {
                if ($stateParams.data.pageTitle) {
                    $rootScope.pageTitle = $stateParams.data.pageTitle + ' | ' + pageTitle;
                }

                $rootScope.breadcrumbs = $stateParams.data.breadcrumbs;
            }

            $rootScope.pageUrl = $location.absUrl();
            // console.log($rootScope.pageUrl);
        });

	}

})();