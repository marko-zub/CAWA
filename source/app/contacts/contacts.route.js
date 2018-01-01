(function() {

    'use strict';

    angular
        .module('app.contacts')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('contacts', {
                url: '/contact-us',
                templateUrl: 'app/contacts/contacts.html',
                controller: 'ContactsController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Contact Us',
                    breadcrumbs: [{
                        title: 'Contact Us',
                        link: null
                    }]
                },
            });
    }

})();