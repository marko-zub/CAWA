(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CompareListontroller', CompareListontroller)
        .component('compareList', {
            templateUrl: 'app/components/compare/compare-list.html',
            bindings: {
                list: '<'
            },
            controller: 'CompareListontroller',
            controllerAs: 'vm'
        });

    CompareListontroller.$inject = ['DecisionCompareService', 'DecisionCompareNotificationService'];

    function CompareListontroller(DecisionCompareService, DecisionCompareNotificationService) {
        var
            vm = this;

    }
})();