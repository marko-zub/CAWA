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

	HeaderController.$inject = ['$state', '$stateParams'];

	function HeaderController($state, $stateParams) {
		var vm = this;

	}

})();