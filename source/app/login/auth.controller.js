(function() {
	'use strict';

	angular
		.module('app.login')
		.controller('AuthController', AuthController);

	AuthController.$inject = ['LoginService', '$stateParams', '$window'];

	function AuthController(LoginService, $stateParams, $window) {
		var vm = this;
		vm.$onInit = onInit;

		function onInit() {
			if ($stateParams.token) {
				var linkToken = $stateParams.token;
				var token = linkToken.split('access_token=')[1];
				LoginService.saveToken(token);
				$window.close();
			}
		}
	}

})();