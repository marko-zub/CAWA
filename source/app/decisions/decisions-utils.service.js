(function() {
	'use strict';

	angular
		.module('app.core')
		.service('DecisionsUtils', DecisionsUtils);

    DecisionsUtils.$inject = ['$sce'];

	function DecisionsUtils($sce) {

        // Move to Utils
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                if (!el.imageUrl) el.imageUrl = '/images/noimage.jpg';

                // Move to constat
                if (el.description && el.description.length > 80) {
                    el.description = el.description.substring(0, 80) + '...';
                }

                if (el.criteriaCompliancePercentage) el.criteriaCompliancePercentage = _.floor(el.criteriaCompliancePercentage, 2);

                if(el.description) el.description = $sce.trustAsHtml(el.description);

                return el;
            });
        }

		return {
			descriptionTrustHtml: descriptionTrustHtml,
		};
	}
})();