(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CommentPostFormController', CommentPostFormController)
        .component('commentPostForm', {
            controller: 'CommentPostFormController',
            controllerAs: 'vm',
            template: renderTemplate
        });


    renderTemplate.$inject = [];

    function renderTemplate() {
        return [
            '<div class="comment-form clearfix">',
                '<text-angular id="dicussion-comment" ng-model="vm.commentContent" ta-maxlength="500" ta-default-wrap="span" name="comment" placeholder = "Comment..." ></text-angular>',
                '<button class="btn btn-primary-2 pull-right" ng-click="vm.saveComment()">Send</button>',
            '</div>'
        ].join('\n');
    }

    CommentPostFormController.$inject = [];

    function CommentPostFormController() {
        var vm = this;
        vm.saveComment = saveComment;

        vm.$onInit = onInit;

        function onInit() {
            vm.commentContent = undefined;
        }

        function saveComment() {
            var sendData = {
                text: vm.commentContent
            };
            if (sendData.text.length) console.log('save', sendData);
        }
    }
})();