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
                collapsed: '<',
                criteriaTitle: '<'
            },
            controller: 'CriteriaListController',
            controllerAs: 'vm'
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
            if (vm.discussion !== true) vm.discussion = false;
            if (vm.collapsed !== false) vm.collapsed = true;
        }

        function onChanges(changes) {
            if (changes.list && !angular.equals(changes.list.currentValue, changes.previousValue)) {
                vm.list = handleChanges(changes.list.currentValue);
            }
        }

        vm.toggleCollapse = toggleCollapse;
        function toggleCollapse(index) {
            if (vm.collapsed === false) return;
            vm.list[index].isCollapsed = !vm.list[index].isCollapsed;
        }

        function handleChanges(list) {
            var copyList = angular.copy(list);
            return _.map(copyList, function (group) {
                group.criteria = _.map(group.criteria, function (criteria) {
                    criteria.weight = _.floor(criteria.weight, 2).toFixed(2);
                    return criteria;
                });
                return group;
            });
        }
    }
})();