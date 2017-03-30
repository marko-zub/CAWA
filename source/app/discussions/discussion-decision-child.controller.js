(function() {

    'user strict';

    angular
        .module('app.discussions')
        .controller('DiscussionDecisionChildController', DiscussionDecisionChildController);

    DiscussionDecisionChildController.$inject = ['decisionBasicInfo', 'DiscussionsDataService', '$stateParams', '$rootScope', 'DecisionDataService', '$state', '$sce'];

    function DiscussionDecisionChildController(decisionBasicInfo, DiscussionsDataService, $stateParams, $rootScope, DecisionDataService, $state, $sce) {
        var vm = this;
        vm.decision = decisionBasicInfo || {}; //Parent Decision

        init();

        // TODO: move to service
        var criteriaIds = [],
            characteristicsIds = [],
            criteriaArray = [],
            characteristicsArray = [];

        function getCriteriaGroupsById(decisionId, criteriaArray) {
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                // vm.criteriaGroups = result;
                criteriaIds = [];
                vm.criteriaGroups = _.filter(result, function(resultEl) {
                    _.filter(resultEl.criteria, function(el) {
                        el.description = $sce.trustAsHtml(el.description);
                        // criteriaIds.push(el.criterionId);
                        // criteriaArray.push(el);

                        var elEqual = _.find(criteriaArray, {
                            criterionId: el.criterionId
                        });

                        if (elEqual) return _.merge(el, elEqual);
                    });

                    return resultEl;
                });
            });
        }

        function getCharacteristictsGroupsById(decisionId, characteristicsArray) {
            // Characteristicts
            return DecisionDataService.getCharacteristictsGroupsById(decisionId).then(function(result) {
                // vm.characteristicGroups = result;
                characteristicsIds = [];

                vm.characteristicGroups = _.map(result, function(resultEl) {
                    _.map(resultEl.characteristics, function(el) {
                        el.description = $sce.trustAsHtml(el.description);
                        characteristicsIds.push(el.characteristicId);
                        characteristicsArray.push(el);

                        return el;
                    });
                    return resultEl;
                });
            });
        }
        // END TODO

        function fillRating(decisionMatrixList) {
            _.map(vm.criteriaGroups, function(group) {
                _.map(group.criteria, function(criteria) {

                    var criteriaNew = _.clone(criteria);
                    _.map(decisionMatrixList.criteria, function(criteriaMatrix) {
                        if (criteriaMatrix.criterionId === criteriaNew.criterionId) {
                            criteria.totalDislikes = criteriaMatrix.totalDislikes;
                            criteria.totalLikes = criteriaMatrix.totalLikes;
                            criteria.totalVotes = criteriaMatrix.totalVotes;
                            criteria.weight = criteriaMatrix.weight;
                        }
                    });
                });
            });
        }

        function init() {
            console.log('Discussion Decision controller');

            // Get criteria and characteristic

            var sendData = {
                includeChildDecisionIds: []
            };

            sendData.includeChildDecisionIds.push($stateParams.discussionId);
            DecisionDataService.searchDecisionMatrix(vm.decision.decisionId, sendData).then(function(result) {
                getCriteriaGroupsById(vm.decision.decisionId, result.decisionMatrixs["0"].criteria);
                getCharacteristictsGroupsById(vm.decision.decisionId, result.decisionMatrixs["0"].characteristics);
                fillRating(result.decisionMatrixs[0]);
            });


            // Child Decision
            DecisionDataService.getDecisionInfo($stateParams.discussionId).then(function(result) {
                vm.decisionChild = result;

                vm.decisionChild.description = $sce.trustAsHtml(vm.decisionChild.description);

                // Add slug for child decision
                if ($stateParams.discussionId &&
                    !$stateParams.discussionSlug &&
                    !$stateParams.critOrCharId) {
                    $state.go('decisions.single.matrix.child', {
                        discussionId: $stateParams.discussionId,
                        discussionSlug: result.nameSlug
                    }, {
                        notify: false,
                        reload: false,
                        location: 'replace'
                    });
                }

                $rootScope.breadcrumbs = [{
                    title: 'Decisions',
                    link: 'decisions'
                }, {
                    title: vm.decision.name,
                    link: 'decisions.single'
                }, {
                    title: 'Comparison Matrix',
                    link: 'decisions.single.matrix'
                }, {
                    title: result.name,
                    link: null
                }];
            });


        }
    }
})();