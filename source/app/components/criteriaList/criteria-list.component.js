(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CriteriaListController', CriteriaListController)
        .component('criteriaList', {
            templateUrl: 'app/components/criteriaList/criteria-list.html',
            bindings: {
                list: '<',
                links: '<'
            },
            controller: 'CriteriaListController',
            controllerAs: 'vm',
        });


    CriteriaListController.$inject = [];

    function CriteriaListController() {
        var
            vm = this;

        vm.$onInit = onInit;

        function onInit() {
            if (!!vm.links) vm.links = true;
        }
    }
})();