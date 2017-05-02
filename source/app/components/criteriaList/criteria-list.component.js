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
            if(!vm.links) vm.links = true;
    }
})();