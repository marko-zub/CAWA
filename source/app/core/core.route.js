(function() {

    'use strict';

    angular
        .module('app.core')
        .config(configuration);

    configuration.$inject = ['$urlMatcherFactoryProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider'];

    function configuration($urlMatcherFactoryProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

        $urlMatcherFactoryProvider.strictMode(false);

        $stateProvider
            .state('404', {
                url: '/404',
                templateUrl: 'app/core/404.html',
                data: {
                  pageTitle : 'Error 404 Not Found!'
                }
            });

        $urlRouterProvider.otherwise('/404');

        $locationProvider.html5Mode({
            enabled: true,
        });

        $locationProvider.hashPrefix('!');
    }

})();
