(function() {
    'use strict';

    angular
        .module('app.login')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login:access_token', // jshint ignore:line
                controller: 'AuthController',
                params: {
                    access_token: { // jshint ignore:line
                        value: null,
                        squash: false
                    },
                }
            })
            .state('loginsocial', {
                url: '/login?access_token', // jshint ignore:line
                controller: 'AuthController',
                params: {
                    access_token: { // jshint ignore:line
                        value: null,
                        squash: false
                    },
                }
            });
    }

})();