(function() {

    'use strict';

    angular
        .module('app.sendgrid')
        .controller('SendgridController', SendgridController);

    SendgridController.$inject = [];

    function SendgridController() {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            console.log('Sendgrid controller');
        }
    }
})();