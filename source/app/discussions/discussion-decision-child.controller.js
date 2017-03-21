(function() {

    'user strict';

    angular
        .module('app.discussions')
        .controller('DiscussionDecisionChildController', DiscussionDecisionChildController);

    DiscussionDecisionChildController.$inject = ['decisionBasicInfo', 'DiscussionsDataService', '$stateParams', '$rootScope', 'DecisionDataService', '$q', '$state', '$sce'];

    function DiscussionDecisionChildController(decisionBasicInfo, DiscussionsDataService, $stateParams, $rootScope, DecisionDataService, $q, $state, $sce) {
        var vm = this;
        vm.decision = decisionBasicInfo || {}; //Parent Decision

        init();

        // TODO: move to service
        function getCriteriaGroupsById(decisionId) {
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                vm.criteriaGroups = result;
                criteriaIds = _.map(result["0"].criteria, function(el) {
                    return el.criterionId;
                });
            });
        }

        function getCharacteristictsGroupsById(decisionId) {
            // Characteristicts
            return DecisionDataService.getCharacteristictsGroupsById(decisionId).then(function(result) {
                vm.characteristicGroups = result;

                characteristicsIds = _.map(result["0"].characteristics, function(el) {
                    return el.characteristicId;
                });
            });
        }

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
            $q.all([getCriteriaGroupsById(vm.decision.decisionId),
                    getCharacteristictsGroupsById(vm.decision.decisionId)
                ])
                .then(function(values) {

                    // Get Rating from Matrix Endpoint
                    var sendData = {
                        includeChildDecisionIds: []
                    };

                    sendData.includeChildDecisionIds.push($stateParams.discussionId);
                    DecisionDataService.searchDecisionMatrix(vm.decision.decisionId, sendData).then(function(result) {
                        fillRating(result.decisionMatrixs[0]);
                    });
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