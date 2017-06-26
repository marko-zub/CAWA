(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('CommentsListController', CommentsListController)
        .component('commentsList', {
            templateUrl: 'app/components/comments/comments-list.html',
            bindings: {
                list: '<'
            },
            controller: 'CommentsListController',
            controllerAs: 'vm'
        });

    CommentsListController.$inject = [];

    function CommentsListController() {
        var
            vm = this;
    }
})();