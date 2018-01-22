(function() {

    'use strict';

    angular
        .module('app.disclaimer')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('disclaimer', {
                url: '/disclaimer',
                templateUrl: 'app/pages/disclaimer/disclaimer.html',
                controller: 'DisclaimerController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Disclaimer',
                    breadcrumbs: [{
                        title: 'Disclaimer',
                        link: null
                    }]
                },
            });
    }

})();