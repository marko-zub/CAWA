(function() {
	'use strict';

	angular
		.module('pascalprecht.translate')
		.config(['$translateProvider', function($translateProvider) {

			// $translateProvider.useStaticFilesLoader({
			// 	prefix: '/languages/',
			// 	suffix: '.json'
			// });

			// $translateProvider.translations('en', {
			// 	'DECISIONS': 'Decisions',
			// 	'USERS': 'Users',
			// 	'SIGN UP': 'Sign up',
			// 	'SEARCH': 'Search...'
			// });

			// $translateProvider.translations('ru', {
			// 	'DECISIONS': 'Решения',
			// 	'USERS': 'Пользователи',
			// 	'SIGN UP': 'Зарегистрироваться',
			// 	'SEARCH': 'Поиск...'
			// });

			// $translateProvider.translations('uk', {
			// 	'DECISIONS': 'Рішення',
			// 	'USERS': 'Користувачі',
			// 	'SIGN UP': 'Зареєструватися',
			// 	'SEARCH': 'Пошук...'
			// });


			// $translateProvider.preferredLanguage('uk');

			$translateProvider.useStaticFilesLoader({
				prefix: '/translations/locale-',
				suffix: '.json'
			});
			$translateProvider.preferredLanguage('en');

		}]);

})();