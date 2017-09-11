(function() {

	'use strict';

	angular
		.module('app.components')
		.component('decisionsListCriteriaCompliance', {
			templateUrl: 'app/components/decisionsList/criteria-compliance-popover.html',
            bindings: {
                decision: '<'
            },
            controller: 'DecisionsListCriteriaCompliance',
            controllerAs: 'vm',			
		});
    DecisionsListCriteriaCompliance.$inject = [];

    function DecisionsListCriteriaCompliance() {
        var
            vm = this;
    }		

})();