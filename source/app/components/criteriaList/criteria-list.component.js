(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CriteriaListController', CriteriaListController)
        .component('criteriaList', {
            templateUrl: 'app/components/criteriaList/criteria-list.html',
            bindings: {
                list: '<',
                links: '<',
                rating: '<',
                discussion: '<',
                criteriaTitle: '<'
            },
            controller: 'CriteriaListController',
            controllerAs: 'vm',
        });


    CriteriaListController.$inject = [];

    function CriteriaListController() {
        var
            vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            if (!!vm.links) vm.links = true;
            if (!vm.rating) vm.rating = false;
            if(vm.discussion !== true) vm.discussion = false;
        }

        function onChanges(changes) {
            if (changes.list && !angular.equals(changes.list.currentValue, changes.previousValue)) {
                vm.list = angular.copy(changes.list.currentValue);
            }
        }
    }
})();