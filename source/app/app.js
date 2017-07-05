(function() {
    'use strict';

    angular.module('app', [
        'app.core',
        'app.home',
        'app.components',
        'app.login',
        'app.decision',
        'app.discussions',
        'app.users',
        'app.tags'
    ]);

    var initInjector = angular.injector(["ng"]),
        $http = initInjector.get("$http"),
        $sce = initInjector.get("$sce");

    // Changed because want to avoid jQuery
    // Now we use jQuery Slim without Ajax functionality
    $http.get($sce.trustAsResourceUrl('app.config'))
        .then(function(result) {
            if (!result.data.baseUrl) return;
            angular.module('app.core').constant('Config', {
                baseUrl: result.data.baseUrl,
                authUrl: result.data.authUrl,
                endpointUrl: result.data.endpointUrl,
                mode: result.data.mode,
                pagePrefix: result.data.pagePrefix
            });
        })
        .catch(function(error) {
            console.log(error);
        })
        .finally(function() {
            $(document).ready(function() {
                angular.bootstrap(document, ['app'], {
                    strictDi: true
                });
            });
        });
})();