(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('DiscussionsController', DiscussionsController);

    DiscussionsController.$inject = [];

    function DiscussionsController() {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            console.log('Discussions controller');
        }

    }
})();