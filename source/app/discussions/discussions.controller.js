(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('DiscussionsController', DiscussionsController);

    DiscussionsController.$inject = ['$rootScope', '$stateParams'];

    function DiscussionsController($rootScope, $stateParams) {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            console.log('Discussions controller');
        }

    }
})();