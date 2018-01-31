(function() {

	'use strict';

	angular
		.module('app.components')
		.controller('CookiePolicyController', CookiePolicyController)
		.component('cookiePolicy', {
			bindings: {
				socialType: '<',
			},
			templateUrl: 'app/common/cookiePolicy/cookie-policy.component.html',
			controller: 'CookiePolicyController',
			controllerAs: 'vm'
		});

	CookiePolicyController.$inject = ['$localStorage'];

	function CookiePolicyController($localStorage) {
		var vm = this;

		vm.$onInit = onInit;

		function onInit() {
			checkPanel();
		}

		function checkPanel() {
			vm.isCookiePanel = !$localStorage.cookieMessage;

			if (vm.isCookiePanel) {
				$('body').addClass('show-cookie-msg');
			} else {
				$('body').removeClass('show-cookie-msg');
			}
		}

		vm.hidePanel = hidePanel;

		function hidePanel() {
			$localStorage.cookieMessage = true;
			checkPanel();
		}
	}
})();