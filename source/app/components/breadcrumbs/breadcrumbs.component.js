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


    BreadcrumbsController.$inject = ['$translate'];

    function BreadcrumbsController($translate) {
        var vm = this;
        // vm.$onInit = onInit;

        // function onInit() {}
        // vm.$onChanges = onChanges;

        // function onChanges(changes) {
        //     // console.log(changes);
        //     if (changes.items &&
        //         !angular.equals(changes.items.currentValue, changes.items.previousValue)) {
        //         vm.items = handle(changes.items.currentValue);
        //     }
        // }

        // function handle(list) {
        //     return _.map(list, function(item) {
        //         return $translate(item.title).then(function(headline) {
        //             return item.title = headline;
        //         }, function(translationId) {
        //             return item.title = translationId;
        //         });
        //     });
        // }
    }

})();