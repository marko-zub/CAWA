(function() {

    'use strict';

    angular
        .module('app.users')
        .controller('UsersController', UsersController);

    UsersController.$inject = [];

    function UsersController() {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            console.log('Users controller');
        }
    }
})();