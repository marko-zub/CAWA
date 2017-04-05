(function() {

    'use strict';

    angular
        .module('app.decision')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('decisions.single', {
                url: '/:id/{slug}?page&size',
                abstract: false,
                views: {
                    "@": {
                        templateUrl: 'app/decision/decision-single.html',
                        controller: 'DecisionSingleController',
                        controllerAs: 'vm',
                    }
                },
                resolve: {
                    decisionBasicInfo: DecisionResolver,
                    decisionStateInfo: DecisionStateResolver
                },
                params: {
                    slug: {
                        value: null,
                        squash: true
                    },
                    page: {
                        value: null,
                        squash: true
                    },
                    size: {
                        value: null,
                        squash: true
                    }
                }
            })
            .state('decisions.single.matrix', {
                url: '/matrix',
                views: {
                    "@": {
                        templateUrl: 'app/decision/decision-matrix.html',
                        controller: 'DecisionMatrixController',
                        controllerAs: 'vm',
                    }
                },
                resolve: {
                    decisionStateInfo: DecisionStateResolver,
                    decisionAnalysisInfo: DecisionAanalysisResolver
                },
            })
            .state('decisions.single.matrixOld', {
                url: '/matrix-old',
                views: {
                    "@": {
                        templateUrl: 'app/decision/decision-matrix-old.html',
                        controller: 'DecisionMatrixControllerOld',
                        controllerAs: 'vm',
                    }
                },
                resolve: {
                    decisionStateInfo: DecisionStateResolver,
                    decisionAnalysisInfo: DecisionAanalysisResolver
                },
            })
            .state('decisions.single.matrix.analysis', {
                url: '/analysis/:analysisId',
                templateUrl: 'app/decision/decision.html',
                controller: 'DecisionController',
                controllerAs: 'vm',
                resolve: {
                    decisionStateInfo: DecisionStateResolver
                },
            });

        // Not use now
        // .state('decisions.single.list', {
        //     url: '/list',
        //     views: {
        //         "@": {
        //             templateUrl: 'app/decision/decision-list.html',
        //             controller: 'DecisionController',
        //             controllerAs: 'vm',
        //         }
        //     },
        //     resolve: {
        //         decisionBasicInfo: DecisionResolver
        //     },
        // })
        // .state('decisions.single.list.analysis', {
        //     url: '/analysis/:analysisId',
        //     abstract: true,
        //     resolve: {
        //         decisionBasicInfo: DecisionResolver
        //     },
        // });
    }


    // Decision State Data
    DecisionStateResolver.$inject = ['decisionBasicInfo', '$stateParams', '$state', '$rootScope'];

    function DecisionStateResolver(decisionBasicInfo, $stateParams, $state, $rootScope) {

        var result = decisionBasicInfo;
        // SLUG for Decision page firt time call
        var decisionSlug = result.nameSlug ? result.nameSlug : '';

        if ($stateParams.slug === null ||
            $stateParams.slug === 'matrix' ||
            $stateParams.slug === 'list') {
            $stateParams.slug = result.nameSlug;
        }


        var stateListener = $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams) {
                var
                    currentState,
                    decisionSlug;

                currentState = $state.current.name;

                // SLUG for Decision page
                // Always set correct slug from server
                // Just added new slug
                if (toState.name === 'decisions.single') {

                    $state.go(currentState, toParams, {
                        notify: false,
                        reload: false,
                        location: 'replace'
                    });
                }

                // TODO: fix it
                // BreadCrumbs
                if ($state.current.name === 'decisions.single.matrix' ||
                    $state.current.name === 'decisions.single.matrix.analysis') {
                    $rootScope.breadcrumbs = [{
                        title: 'Decisions',
                        link: 'decisions'
                    }, {
                        title: result.name,
                        link: 'decisions.single'
                    }, {
                        title: 'Comparison Matrix',
                        link: null
                    }];

                }

                // TODO: find better way
                // Remove size & page params
                if ($state.current.name !== 'decisions.single') {
                    $state.go($state.current.name, {
                        page: null,
                        size: null
                    }, {
                        notify: false,
                        reload: false,
                        location: 'replace'
                    });
                }

                //unsubscribe event listener
                stateListener();
            });
    }

    // Decision Data
    DecisionResolver.$inject = ['DecisionDataService', '$stateParams', '$state'];

    function DecisionResolver(DecisionDataService, $stateParams, $state) {
        return DecisionDataService.getDecisionInfo($stateParams.id).then(function(result) {
            if (result.error && result.error.code === 404) {
                console.log(result.error);
                $state.go('404');
            }

            return result;
        }).catch(function() {
            $state.go('404');
        });
    }

    // Analysis
    DecisionAanalysisResolver.$inject = ['$stateParams', 'DecisionDataService', '$location', 'DecisionSharedService'];

    function DecisionAanalysisResolver($stateParams, DecisionDataService, $location, DecisionSharedService) {

        // TODO: find better way
        // UI route bug https://github.com/angular-ui/ui-router/issues/1856#issuecomment-93025037
        // resolves will only get the parameters for the state on which it is defined
        var path,
            urlParams,
            analysisId,
            analysisSlug;

        path = $location.path();
        urlParams = path.split('/');
        analysisId = urlParams[urlParams.length - 1];
        analysisSlug = urlParams[urlParams.length - 2];

        // console.log(analysisSlug, analysisId);
        if (analysisSlug === 'analysis' && analysisId) {
            return DecisionDataService.getDecisionAnalysis(analysisId).then(function(resp) {
                if (resp.error) {
                    console.log(resp.error);
                    return;
                }

                // Set analysis obj
                DecisionSharedService.setFilterObject(resp);

                return resp;
            }, function(req) {
                console.log(req);
            });
        }

    }


})();