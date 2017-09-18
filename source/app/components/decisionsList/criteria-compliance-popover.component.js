(function() {

	'use strict';

	angular
		.module('app.components')
        .controller('DecisionsListCriteriaComplianceController', DecisionsListCriteriaComplianceController)
		.component('criteriaCompliancePopover', {
			templateUrl: 'app/components/decisionsList/criteria-compliance-popover.html',
            bindings: {
                decision: '<',
                parentDecision: '<',
            },
            controller: 'DecisionsListCriteriaComplianceController',
            controllerAs: 'vm'
		});
    DecisionsListCriteriaComplianceController.$inject = [];

    function DecisionsListCriteriaComplianceController() {
        var
            vm = this;
    }

})();