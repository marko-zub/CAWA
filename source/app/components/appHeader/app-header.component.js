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

	HeaderController.$inject = [];

	function HeaderController() {
		var vm = this;
        vm.$onInit = onInit;
        function onInit() {}  
	}

})();