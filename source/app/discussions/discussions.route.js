(function() {

    'use strict';

    angular
        .module('app.discussions')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('decisions.single.matrix.child', {
                url: '/:discussionId/{discussionSlug}',
                views: {
                    "@": {
                        templateUrl: 'app/discussions/discussion-decision-child.html',
                        controller: 'DiscussionDecisionChildController',
                        controllerAs: 'vm',
                    }
                },
                params: {
                    discussionSlug: {
                        value: null,
                        squash: true
                    }
                }
            })
            .state('decisions.single.matrix.child.option', {
                url: '/:critOrCharId/{critOrCharSlug}',
                views: {
                    "@": {
                        templateUrl: 'app/discussions/discussion-decision-child-option.html',
                        controller: 'DiscussionDecisionChildOptionController',
                        controllerAs: 'vm',
                    }
                },
                resolve: {
                    decisionDiscussionInfo: DecisionSingleDiscussionResolver
                },
                params: {
                    critOrCharId: {
                        value: null,
                        squash: true
                    }
                }
            });
    }



    // Decision Data
    DecisionSingleDiscussionResolver.$inject = ['DiscussionsDataService', '$stateParams', '$state', '$rootScope', '$location'];

    function DecisionSingleDiscussionResolver(DiscussionsDataService, $stateParams, $state, $rootScope, $location) {
        return DiscussionsDataService.searchCommentableDiscussion($stateParams.discussionId, $stateParams.critOrCharId)
            .then(function(resp) {
                return resp;
            })
            .catch(function(err) {
                console.log(err);
                return err;
            });
    }

})();