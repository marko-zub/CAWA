(function() {

    'use strict';

    angular
        .module('app.login')
        .controller('LoginController', LoginController)
        .directive('appLogin', appLogin);

    function appLogin() {
        var directive = {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'app/login/login.html',
            controller: 'LoginController',
            controllerAs: 'vm'
        };

        return directive;
    }

    LoginController.$inject = ['$window', 'LoginService', '$scope'];

    function LoginController($window, LoginService, $scope) {
        var vm = this;

        vm.loginService = LoginService;
        vm.loginService.checkLogin();
        vm.user = vm.loginService.getUser();

        vm.logout = logout;

        function logout() {
            vm.loginService.logout();
            $('form').submit();
        }

        $scope.$watch(vm.loginService.getToken, function(newVal, oldVal) {
            if (newVal && oldVal !== newVal) {
               vm.loginService.setLoginStatus(true);
               vm.loginService.setUserFromToken(newVal);
               vm.user = vm.loginService.getUser();
            }
        });
    }

})();
