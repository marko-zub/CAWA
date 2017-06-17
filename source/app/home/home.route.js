(function() {

    'use strict';

    angular
        .module('app.home')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/home/home.html',
                controller: 'HomeController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Home'
                },
                params: {
                    sort: {
                        value: null,
                        squash: true
                    }
                }
            });
    }

})();