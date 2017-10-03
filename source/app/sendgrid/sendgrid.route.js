(function() {

    'use strict';

    angular
        .module('app.sendgrid')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('sendgrid', {
                url: '/sendgrid',
                templateUrl: 'app/sendgrid/sendgrid.html',
                controller: 'SendgridController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'sendgrid'
                },
                params: {
                    tab: {
                        value: null,
                        squash: true
                    }
                }
            });
    }

})();