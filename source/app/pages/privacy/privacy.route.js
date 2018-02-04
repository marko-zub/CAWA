(function() {

    'use strict';

    angular
        .module('app.privacy')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('privacy', {
                url: '/privacy-policy',
                templateUrl: 'app/pages/privacy/privacy.html',
                data: {
                    pageTitle: 'Privacy Policy',
                    breadcrumbs: [{
                        title: 'Privacy Policy',
                        link: null
                    }]
                },
            });
    }

})();