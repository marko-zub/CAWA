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
                    '@': {
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
            .state('decisions.single.parent.characteristics', {
                url: '/characteristics/:characteristicId/:characteristicSlug',
                views: {
                    '@': {
                        templateUrl: 'app/discussions/decision-characteristics.html',
                        controller: 'DeicisionCharacteristicsController',
                        controllerAs: 'vm',
                    }
                }
                // resolve: {
                //     decisionDiscussionInfo: DecisionSingleDiscussionResolver
                // }
            })            
            .state('decisions.single.parent.reviews', {
                url: '/reviews/:reviewId/:reviewSlug',
                views: {
                    '@': {
                        templateUrl: 'app/discussions/decision-reviews.html',
                        controller: 'DeicisionReviewsController',
                        controllerAs: 'vm',
                    }
                }
                // resolve: {
                //     decisionDiscussionInfo: DecisionSingleDiscussionResolver
                // }
            });
    }



    // Decision Data
    // DecisionSingleDiscussionResolver.$inject = ['DiscussionsDataService', '$stateParams', '$state', '$rootScope', '$location'];

    // function DecisionSingleDiscussionResolver(DiscussionsDataService, $stateParams, $state, $rootScope, $location) {
    //     return DiscussionsDataService.searchCommentableDiscussion($stateParams.discussionId, $stateParams.critOrCharId)
    //         .then(function(resp) {
    //             return resp;
    //         })
    //         .catch(function(err) {
    //             console.log(err);
    //             return err;
    //         });
    // }

})();