(function() {

    'use strict';

    angular
        .module('app.core')
        .config(configuration);

    configuration.$inject = ['$urlMatcherFactoryProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider'];

    function configuration($urlMatcherFactoryProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

        $urlMatcherFactoryProvider.strictMode(false);

        $urlRouterProvider.otherwise('/404');

        $locationProvider.html5Mode({
            enabled: true
        });

        $locationProvider.hashPrefix('!');
    }

})();