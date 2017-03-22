(function() {

    'use strict';

    angular
        .module('app.core')
        .config(configuration);

    configuration.$inject = ['$urlMatcherFactoryProvider', '$stateProvider', '$urlRouterProvider', '$compileProvider', 'Config', '$locationProvider'];

    function configuration($urlMatcherFactoryProvider, $stateProvider, $urlRouterProvider, $compileProvider, Config, $locationProvider) {

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

        $compileProvider.debugInfoEnabled(Config.mode === 'dev');

        $locationProvider.html5Mode({
            enabled: true,
            // requireBase: false
        });

        $locationProvider.hashPrefix('!');
    }

})();
