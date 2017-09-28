(function() {
    'use strict';

    angular
        .module('app')
        .run(runBlock);

    runBlock.$inject = ['$rootScope', '$state', '$stateParams', '$location', 'Config', 'translateFilter', '$translate', '$localStorage', 'TranslateConstant'];

    function runBlock($rootScope, $state, $stateParams, $location, Config, translateFilter, $translate, $localStorage, TranslateConstant) {
        var pageTitle = Config.pagePrefix;
        $rootScope.url = '';

        // Language
        $rootScope.translateCode = 'en';
        if ($localStorage.translateCode && _.includes(TranslateConstant.LANG_KEYS, $localStorage.translateCode)) {
            $rootScope.translateCode = $localStorage.translateCode;
        }
        $translate.use($rootScope.translateCode);

        // TODO: simplify logic
        // Move to service
        $rootScope.decisonViewsCount = true;
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                if (toState && fromState && toState.name === fromState.name ||
                    (fromState.name === 'decisions.single' && toState.name.indexOf('decisions.single') >= 0)) {
                    $rootScope.decisonViewsCount = false;
                } else {
                    $rootScope.decisonViewsCount = true;
                }


                $rootScope.decisonFull = false;
                // Get full deciison
                if($state.current.name !== toState.name && toState.name === 'decisions.single') {
                    $rootScope.decisonFull = true;
                    // event.preventDefault();
                    debugger
                    $state.transitionTo(toState.name, toParams, {
                        notify: false,
                        reload: true,
                    });



                    // $state.reload();
                    // event.preventDefault();
                }

                // Scroll to top page after change url
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            });

        $rootScope.breadcrumbs = true;

        var stateListener = $rootScope.$on('$stateChangeSuccess', function($state, $stateParams) {
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
                }
            }

            $rootScope.pageUrl = $location.absUrl();
            // console.log($rootScope.pageUrl);
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
            $(window).scroll(_.throttle(headerClass, 300));
        }

    }

})();