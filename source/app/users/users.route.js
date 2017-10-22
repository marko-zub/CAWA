(function() {

    'use strict';

    angular
        .module('app.users')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('users', {
                url: '/users',
                views: {
                    '@': {
                        templateUrl: 'app/users/users.html',
                        controller: 'UsersController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    breadcrumbs: [{
                        title: 'Users',
                        link: null
                    }]
                },
            });
    }

})();