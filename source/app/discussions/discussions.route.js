(function() {

    'use strict';

    angular
        .module('app.discussions')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('discussions', {
                url: '/discussions',
                views: {
                    "@": {
                        templateUrl: 'app/discussions/discussions.html',
                        controller: 'DiscussionsController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    breadcrumbs: [{
                        title: 'Discussions',
                        link: null
                    }]
                },
            })        
            .state('decisions.single.comparison.child', {
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
            .state('decisions.single.comparison.child.option', {
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