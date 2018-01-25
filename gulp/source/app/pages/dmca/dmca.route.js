(function() {

    'use strict';

    angular
        .module('app.dmca')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('dmca', {
                url: '/dmca',
                templateUrl: 'app/pages/dmca/dmca.html',
                controller: 'DmcaController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'DMCA',
                    breadcrumbs: [{
                        title: 'DMCA',
                        link: null
                    }]
                },
            });
    }

})();