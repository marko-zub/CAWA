(function() {
    'use strict';

    angular
        .module('app.core')
        .service('DecisionsUtils', DecisionsUtils);

    DecisionsUtils.$inject = ['$sce', 'DecisionsConstant'];

    function DecisionsUtils($sce, DecisionsConstant) {

        // private
        function htmlToPlaintext(text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        }

        // public
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

        function prepareDecisionSingleToUI(decision, hideEmptyImage, cutDescription) {

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
            if (cutDescription !== false && decision.description && decision.description.length > DecisionsConstant.SHORT_TEXT_LENGTH) {
                var shortText = htmlToPlaintext(decision.description.substring(0, DecisionsConstant.SHORT_TEXT_LENGTH));
                decision.description = shortText + '...';
            }

            if (decision.criteriaCompliancePercentage) {
                decision.criteriaCompliancePercentage = _.floor(decision.criteriaCompliancePercentage, 2).toFixed(2);
            }


            if (decision.medias && decision.medias.length) {
                var findLogo = _.find(decision.medias, function(media) {
                    return media.type === 'IMAGE';
                });
                decision.metaOgImage = findLogo ? findLogo.url : decision.imageUrl;
            }

            if (decision.description && typeof decision.description === 'string') {
                decision.description = _.unescape(decision.description.replace(/(&#13;)?&#10;/g, '<br/>'));

                var oggDescription = htmlToPlaintext(decision.description.substring(0, DecisionsConstant.OG_TEXT_LENGTH));
                decision.oggDescription = oggDescription;

                decision.description = $sce.trustAsHtml(decision.description);
            }

            return decision;
        }

        function prepareDecisionLogoToUI(decision) {
            var mediaLogo = _.find(decision.medias, function(media) {
                return media.type === 'LOGO';
            });

            if (mediaLogo) decision.imageUrl = mediaLogo.url;
            return decision;
        }


        function mergeCharacteristicsDecisions(decision, characteristicsArray) {
            if (!decision) return characteristicsArray;
            var currentDecisionCharacteristics = decision.characteristics;
            return _.filter(characteristicsArray, function(resultEl) {
                _.map(resultEl.characteristics, function(el) {
                    // el.description = $sce.trustAsHtml(el.description);

                    var elEqual = _.find(currentDecisionCharacteristics, {
                        id: el.id
                    });

                    if (elEqual) {
                        el.decision = elEqual;
                        return el;
                    }
                });
                if (resultEl.characteristics.length > 0) return resultEl;
            });
        }

        function characteristicGroupsFullDescription(list) {
            return _.map(list, function(characteristicGroup) {
                characteristicGroup.characteristics = _.map(characteristicGroup.characteristics, function(characteristic) {
                    var characteristicNew = Object.assign(characteristic);
                    characteristicNew.descriptionFull = true;
                    return characteristicNew;
                });
                return characteristicGroup;
            });
        }

        return {
            prepareDecisionSingleToUI: prepareDecisionSingleToUI,
            prepareDecisionToUI: prepareDecisionToUI,
            mergeCriteriaDecision: mergeCriteriaDecision,
            prepareDecisionLogoToUI: prepareDecisionLogoToUI,
            mergeCharacteristicsDecisions: mergeCharacteristicsDecisions,
            characteristicGroupsFullDescription: characteristicGroupsFullDescription,
        };

    }

})();