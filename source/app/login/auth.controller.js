(function() {
    'use strict';

    angular
        .module('app.login')
        .controller('AuthController', AuthController);

    AuthController.$inject = ['LoginService', '$location', '$stateParams', '$window'];

    function AuthController(LoginService, $location, $stateParams, $window) {
        var vm = this;
        vm.$onInit = onInit;

        function onInit() {
            if ($stateParams.access_token) {
                var token = $stateParams.access_token;
                LoginService.saveToken(token);
                $window.close();
            }
        }
    }

})();