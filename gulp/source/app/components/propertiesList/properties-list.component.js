(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('PropertiesListController', PropertiesListController)
        .component('propertiesList', {
            templateUrl: 'app/components/propertiesList/properties-list.html',
            bindings: {
                list: '<',
                links: '<',
                comments: '<',
                rating: '<',
                discussion: '<'
            },
            controller: 'PropertiesListController',
            controllerAs: 'vm',
        });


    PropertiesListController.$inject = [];

    function PropertiesListController() {
        // var
        //     vm = this;

        // vm.$onInit = onInit;
        // function onInit() {
        // }
    }
})();