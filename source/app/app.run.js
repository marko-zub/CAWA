(function() {
    'use strict';

    angular
        .module('app')
        .run(runBlock);

    runBlock.$inject = ['$rootScope', '$state', '$stateParams', '$location', 'Config', 'translateFilter', '$translate', '$localStorage', 'TranslateConstant'];

    function runBlock($rootScope, $state, $stateParams, $location, Config, translateFilter, $translate, $localStorage, TranslateConstant) {
        var pageTitle = Config.pagePrefix;
        $rootScope.url = '';

        // Set default options object local storage
        // Only view/layout options without any vital data
        if (!$localStorage.options ||
            ($localStorage.options && (!$localStorage.options.comparePanel ||
                !$localStorage.options.view))) { // Remove in future
            $localStorage.options = {
                comparePanel: {
                    isOpen: false
                },
                view: {
                    layoutMode: 'list'
                }
            };
        }

        // Language Local storage
        $rootScope.translateCode = 'en';
        if ($localStorage.translateCode && _.includes(TranslateConstant.LANG_KEYS, $localStorage.translateCode)) {
            $rootScope.translateCode = $localStorage.translateCode;
        }
        $translate.use($rootScope.translateCode);

        // TODO: simplify logic
        // Move to service
        $rootScope.decisonViewsCount = true;
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState) {

                // Set auth token
                // Oauth return link with hash '#' for social login
                // but for login/pass without
                var url = $location.absUrl();
                if (url.indexOf('#access_token') >= 0) {
                    // debugger
                    var accessToken = $location.hash().split('&')[0];
                    if (accessToken) {
                        toParams.access_token = accessToken.replace('access_token=', ''); // jshint ignore:line
                    }
                } 

                if (toState && fromState && toState.name === fromState.name ||
                    (fromState.name === 'decisions.single' && toState.name.indexOf('decisions.single') >= 0)) {
                    $rootScope.decisonViewsCount = false;
                } else {
                    $rootScope.decisonViewsCount = true;
                }


                $rootScope.decisonFull = false;
                // Get full deciison
                if (toState.name === 'decisions.single') {
                    $rootScope.decisonFull = true;
                }

                // Scroll to top page after change url
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            });

        $rootScope.breadcrumbs = true;

        $rootScope.$on('$stateChangeSuccess', function($state, $stateParams) {
            if (angular.isDefined($stateParams.data)) {
                if ($stateParams.data.pageTitle) {
                    $rootScope.pageTitle = translateFilter($stateParams.data.pageTitle) + ' | ' + pageTitle;
                } else {
                    $rootScope.pageTitle = pageTitle;
                }

                $rootScope.breadcrumbs = $stateParams.data.breadcrumbs;

                $rootScope.socialScriptType = 'default';
                if ($stateParams.data.socialScriptType) {
                    $rootScope.socialScriptType = $stateParams.data.socialScriptType;
                }
                if ($stateParams.data.bodyClass) {
                    $rootScope.bodyClass = 'body-' + $stateParams.data.bodyClass;
                } else {
                    $rootScope.bodyClass = 'body-' + $stateParams.name.replace(/\./g, '-');
                }
            }

            $rootScope.pageUrl = $location.absUrl();
        });

        // Box shadow on scroll for header
        function headerClass() {
            var header = $(document).scrollTop();
            if (header > 10) {
                $('#app-header').addClass('scroll');
            } else {
                $('#app-header').removeClass('scroll');
            }
        }

        if ($(window).width() > 1024) {
            $(window).on('scroll', _.throttle(headerClass, 300));
        }

    }

})();