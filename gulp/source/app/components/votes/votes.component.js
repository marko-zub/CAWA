(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('VotesController', VotesController)
        .component('appVotes', {
            templateUrl: 'app/components/votes/votes.html',
            controller: 'VotesController',
            controllerAs: 'vm'
        });

    VotesController.$inject = [];

    function VotesController() {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
        }
    }

})();