(function() {

	'use strict';

	angular
		.module('app.components')
		.controller('HeaderNavController', HeaderNavController)
		.component('headerNav', {
			bindings: {
				socialType: '<',
			},
			templateUrl: 'app/common/headerNav/header-nav.html',
			controller: 'HeaderNavController',
			controllerAs: 'vm'
		});

	HeaderNavController.$inject = [];

	function HeaderNavController() {
		var vm = this;

		vm.$onInit = onInit;
		vm.$postLink = postLink;

		function onInit() {
			checkSize();
		}

		vm.toggleNav = toggleNav;

		function toggleNav() {
			vm.isOpen = !vm.isOpen;
		}

		function postLink() {
			checkSize();
			$(window).on('resize', _.throttle(checkSize, 300));
		}

		function checkSize() {
			if ($(window).width() < 992) {
				vm.isOpen = false;
			} else {
				vm.isOpen = true;
			}
		}
	}
})();