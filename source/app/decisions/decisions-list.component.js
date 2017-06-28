(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('DecisionsListController', DecisionsListController)
        .component('decisionsList', {
            templateUrl: 'app/decisions/decisions-list.html',
            bindings: {
                list: '<',
                criteriaCompliance: '<'
            },
            controller: 'DecisionsListController',
            controllerAs: 'vm',
        });


    DecisionsListController.$inject = ['$sce'];

    function DecisionsListController($sce) {
        var
            vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;
        var decisionsHeight = 97;
        // TODO: avoid height


        function onInit() {
            if (!vm.list) return;
            vm.decisionsHeight = vm.list.length * decisionsHeight + 'px';
            vm.decisionsList = descriptionTrustHtml(vm.list);
        }

        function onChanges(changes) {
            if (changes.list && changes.list.currentValue &&
                !angular.equals(changes.list.currentValue, changes.list.previousValue)) {
                vm.decisionsHeight = changes.list.currentValue.length * decisionsHeight + 'px';
                vm.decisionsList = descriptionTrustHtml(changes.list.currentValue);
            }
        }

        // Move to Utils
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                if (!el.imageUrl) el.imageUrl = '/images/noimage.jpg';

                // Move to constat
                if (el.description && el.description.length > 80) {
                    el.description = el.description.substring(0, 80) + '...';
                }
                
                if (el.criteriaCompliancePercentage) el.criteriaCompliancePercentage = _.floor(el.criteriaCompliancePercentage, 2);
                
                el.description = $sce.trustAsHtml(el.description);

                return el;
            });
        }
    }
})();