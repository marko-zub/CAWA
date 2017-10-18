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
                    el.criteriaCompliancePercentage = _.floor(el.criteriaCompliancePercentage, 2).toFixed(2);
                }

                if (el.description) {
                    el.description = el.description.replace(/(&#13;)?&#10;/g, '<br/>');
                    el.description = $sce.trustAsHtml(el.description);
                }

                return el;
            });
        }

        var emptyCriteria = { weight: 0, totalVotes: 0 };
        function mergeCriteriaDecision(currentDecisionCriteria, criteriaGroupsArray) {
            var currentDecisionCriteriaCopy = angular.copy(currentDecisionCriteria);
            var criteriaGroupsArrayCopy = angular.copy(criteriaGroupsArray);

            return _.filter(criteriaGroupsArrayCopy, function(resultEl) {
               _.filter(resultEl.criteria, function(el) {

                    var elEqual = _.find(currentDecisionCriteriaCopy, {
                        id: el.id
                    });

                    if (elEqual) return _.merge(el, elEqual);
                });

                if (resultEl.criteria.length >= 0) return resultEl;
            });
        }        

        return {
            prepareDecisionToUI: prepareDecisionToUI,
            mergeCriteriaDecision: mergeCriteriaDecision
        };
    }
    
})();