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
                return prepareDecisionSingleToUI(el);
            });
        }

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

                if (resultEl.criteria && resultEl.criteria.length >= 0) return resultEl;
            });
        }

        return {
            prepareDecisionSingleToUI: prepareDecisionSingleToUI,
            prepareDecisionToUI: prepareDecisionToUI,
            mergeCriteriaDecision: mergeCriteriaDecision
        };

        function prepareDecisionSingleToUI(decision, hideEmptyImage) {

            if (!decision.imageUrl) {
                decision.imageUrl = decision.logoUrl;
                if (hideEmptyImage !== true && !decision.imageUrl) {
                    decision.imageUrl = '/images/noimage.jpg';
                }
            }

            var url = decision.imageUrl;
            if (decision.imageUrl) {
                var ulrArray = url.split('.');
                if (ulrArray.length && ulrArray[ulrArray.length - 1] === 'svg') {
                    decision.imageStyle = true;
                }
            }


            // Move to constat
            if (decision.description && decision.description.length > DecisionsConstant.SHORT_TEXT_LENGTH) {
                decision.description = decision.description.substring(0, DecisionsConstant.SHORT_TEXT_LENGTH) + '...';
            }

            if (decision.criteriaCompliancePercentage) {
                decision.criteriaCompliancePercentage = _.floor(decision.criteriaCompliancePercentage, 2).toFixed(2);
            }

            if (decision.description && typeof decision.description === 'string') {
                decision.description = _.unescape(decision.description.replace(/(&#13;)?&#10;/g, '<br/>'));
                decision.description = $sce.trustAsHtml(decision.description);
            }

            return decision;
        }
    }

})();