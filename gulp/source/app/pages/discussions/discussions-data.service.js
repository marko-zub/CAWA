(function() {

    'use strict';

    angular
        .module('app.discussions')
        .factory('DiscussionsDataService', DiscussionsDataService);

    DiscussionsDataService.$inject = ['$resource', 'Config'];

    function DiscussionsDataService($resource, Config) {
        var
            discussionsUrl = Config.endpointUrl + 'discussions',

            discussions = $resource(discussionsUrl, {
                id: '@id'
            }),

            searchCommentableDiscussionUrl = $resource(Config.endpointUrl + 'decisions/:discussionId/commentables/:critOrCharId', {
                discussionId: '@discussionId',
                critOrCharId: '@critOrCharId',
            }),

            searchCommentableVotesWeightUrl = $resource(Config.endpointUrl + 'votes/forentity/:discussionId/onentity/:critOrCharId/weighted', {
                discussionId: '@discussionId',
                critOrCharId: '@critOrCharId',
            });

        var service = {
            searchDiscussions: searchDiscussions,
            searchCommentableDiscussion: searchCommentableDiscussion,
            searchCommentableVotesWeight: searchCommentableVotesWeight
        };

        return service;

        function searchDiscussions(id, data) {
            return discussions.searchDiscussionsById({
                id: id
            }, data).$promise;
        }

        function searchCommentableDiscussion(discussionId, critOrCharId) {
            // console.log(discussionId, critOrCharId);

            // if (!discussionId && !critOrCharId) return;
            return searchCommentableDiscussionUrl.get({
                discussionId: discussionId,
                critOrCharId: critOrCharId
            }).$promise;
        }

        function searchCommentableVotesWeight(discussionId, critOrCharId) {
            // if (!discussionId && !critOrCharId) return;
            return searchCommentableVotesWeightUrl.get({
                discussionId: discussionId,
                critOrCharId: critOrCharId
            }).$promise;
        }
    }
})();