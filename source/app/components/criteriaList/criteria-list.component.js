(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CriteriaListController', CriteriaListController)
        .component('criteriaList', {
            templateUrl: 'app/components/criteriaList/criteria-list.html',
            bindings: {
                list: '<'
            },
            controller: 'CriteriaListController',
            controllerAs: 'vm',
        });


    CriteriaListController.$inject = [];

    function CriteriaListController() {
        var
            vm = this;
    }
})();