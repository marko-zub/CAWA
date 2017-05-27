(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('BreadcrumbsController', BreadcrumbsController)
        .component('breadcrumbs', {
            templateUrl: 'app/components/breadcrumbs/breadcrumbs.html',
            bindings: {
                items: '<'
            },
            controller: 'BreadcrumbsController',
            controllerAs: 'vm'
        });


    BreadcrumbsController.$inject = [];

    function BreadcrumbsController() {
        var vm = this;        
        // vm.$onChanges = onChanges;

        // function onChanges(changes) {
        //     console.log(changes);
        // }
    }

})();