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
                        templateUrl: 'app/pages/users/users.html',
                        // controller: 'UsersController',
                        // controllerAs: 'vm'
                    }
                },
                data: {
                    pageTitle: 'Users',
                    breadcrumbs: [{
                        title: 'Users',
                        link: null
                    }]
                },
            });
    }

})();