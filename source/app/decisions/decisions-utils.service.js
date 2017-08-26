(function() {
    'use strict';

    angular
        .module('app.core')
        .service('DecisionsUtils', DecisionsUtils);

    DecisionsUtils.$inject = ['$sce', 'DecisionsConstant'];

    function DecisionsUtils($sce, DecisionsConstant) {

        // Move to Utils
        function prepareDecisionToUI(list) {
            return _.map(list, function(el) {
                if (!el.imageUrl) {
                    el.imageUrl = el.logoUrl || '/images/noimage.jpg';
                }

                // Move to constat
                if (el.description && el.description.length > DecisionsConstant.SHORT_TEXT_LENGTH) {
                    el.description = el.description.substring(0, DecisionsConstant.SHORT_TEXT_LENGTH) + '...';
                }

                if (el.criteriaCompliancePercentage) {
                    el.criteriaCompliancePercentage = _.floor(el.criteriaCompliancePercentage, 2);
                }

                if (el.description) {
                    el.description = $sce.trustAsHtml(el.description);
                }

                return el;
            });
        }

        return {
            prepareDecisionToUI: prepareDecisionToUI,
        };
    }
})();