(function() {
	'use strict';

	angular
		.module('pascalprecht.translate')
		.config(['$translateProvider', function($translateProvider) {

			$translateProvider.useStaticFilesLoader({
				prefix: '/translations/locale-',
				suffix: '.json'
			});
			$translateProvider.preferredLanguage('en');

		}]);

})();