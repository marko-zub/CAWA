(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CommentsController', CommentsController)
        .component('comments', {
            templateUrl: 'app/components/comments/comments.html',
            bindings: {
                id: '<',
                optionId: '<'
            },
            controller: 'CommentsController',
            controllerAs: 'vm'
        });

    CommentsController.$inject = [];

    function CommentsController() {
        var vm = this;

        vm.$onInit = onInit;
        function onInit() {
            // console.log(vm);
            // searchCommentableVotesWeight();
        }

        // function searchCommentableVotesWeight(discussionId, critOrCharId) {
        //     if (!discussionId || !critOrCharId) return;
        //     DiscussionsDataService.searchCommentableVotesWeight(discussionId, critOrCharId)
        //         .then(function(resp) {
        //             // console.log(resp);
        //             vm.discussion.votes = resp;
        //         }).catch(function(err) {
        //             console.log(err);
        //         });
        // }
    }
})();