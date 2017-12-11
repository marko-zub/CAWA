(function() {
	'use strict';

	angular
		.module('app.login')
		.config(configuration);

	configuration.$inject = ['$stateProvider'];

	function configuration($stateProvider) {
		$stateProvider
			.state('login', {
				url: '/login?token',
				controller: 'AuthController',
				params: {
					token: {
						value: null,
						squash: false
					},
				}
			});
	}

})();