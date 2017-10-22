(function() {

    'use strict';

    angular
        .module('app.decision')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('search', {
                url: '/search?page&size&query',
                views: {
                    '@': {
                        templateUrl: 'app/search/search.html',
                        controller: 'SearchController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    breadcrumbs: [{
                        title: 'Search',
                        link: null
                    }]
                },
                params: {
                    query: {
                        value: null,
                        squash: true
                    },
                    page: {
                        value: null,
                        squash: true
                    },
                    size: {
                        value: null,
                        squash: true
                    }
                }
            });
    }

})();