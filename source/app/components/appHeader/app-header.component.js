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

	HeaderController.$inject = ['$state', '$stateParams', '$rootScope'];

	function HeaderController($state, $stateParams, $rootScope) {
		var vm = this;

        // Page title
        var pageTitle = 'DecisionWanted';
        $rootScope.pageTitle = pageTitle;
        $rootScope.breadcrumbs = false;

        $rootScope.$on('$stateChangeSuccess', function($state, $stateParams) {
            if (angular.isDefined($stateParams.data)) {
                if ($stateParams.data.pageTitle) {
                    $rootScope.pageTitle = $stateParams.data.pageTitle + ' | ' + pageTitle;
                }

                $rootScope.breadcrumbs = $stateParams.data.breadcrumbs;
            }
        });
	}

})();