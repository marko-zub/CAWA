(function() {

    'use strict';

    angular
        .module('app.core')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('404', {
                url: '/404',
                templateUrl: 'app/pages/404/404.html',
                data: {
                  pageTitle : 'Error 404 Not Found!'
                }
            });
    }

})();