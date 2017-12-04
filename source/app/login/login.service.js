(function() {

    'use strict';

    angular
        .module('app.login')
        .factory('LoginService', LoginService);

    LoginService.$inject = ['jwtHelper', '$localStorage', '$window', 'Config', '$location', '$sce'];

    function LoginService(jwtHelper, $localStorage, $window, Config, $location, $sce) {
        var
            user = {},
            isLogged = false;

        var service = {
            getUser: getUser,
            setUserFromToken: setUserFromToken,
            getLoginStatus: getLoginStatus,
            setLoginStatus: setLoginStatus,
            saveToken: saveToken,
            logout: logout,
            login: login,
            getToken: getToken,
            checkLogin: checkLogin,
            getLogoutUrl: getLogoutUrl
        };

        return service;

        function logout() {
            delete $localStorage.token;
            setUser({});
            setLoginStatus(false);
        }

        function login() {
            //TODO extract to config or constants
            var
                loginUrl = 'oauth/authorize?response_type=token&client_id=decisionwanted_client_id&redirect_uri=',
                returnUrl = $location.absUrl().split('/')[0] + '/login/&';
                // TODO: remove from url /& 

            $window.open(Config.authUrl +
                loginUrl +
                encodeURIComponent(returnUrl),
                '_blank',
                'width=600, height=300');
        }

        function saveToken(token) {
            $localStorage.token = token;
        }

        function getToken() {
            return $localStorage.token;
        }

        function getUser() {
            return user;
        }

        function setUser(info) {
            user = info;
        }

        function setUserFromToken(token) {
            user = jwtHelper.decodeToken(token);
        }

        function getLoginStatus() {
            return isLogged;
        }

        function setLoginStatus(status) {
            isLogged = status;
        }

        function getLogoutUrl() {
            return $sce.trustAsResourceUrl(Config.authUrl + 'logout');
        }

        //TODO add check request
        function checkLogin() {
            var token = $localStorage.token;
            if (token) {
                isLogged = true;
                setUserFromToken(token);
            }
        }
    }
})();