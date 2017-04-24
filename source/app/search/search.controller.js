(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('DiscussionsController', DiscussionsController);

    DiscussionsController.$inject = ['$rootScope', '$stateParams'];

    function DiscussionsController($rootScope, $stateParams) {
        var vm = this;

        console.log('Search controller');

    }
})();