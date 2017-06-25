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
                    },
                    tab: {
                        value: null,
                        squash: true
                    }
                }
            })

        // TODO: matrix and single.parent state have some bugs
        .state('decisions.single.comparison', {
                url: '/comparison/{analysisId}',
                views: {
                    "@": {
                        templateUrl: 'app/decision/decision-matrix.html',
                        controller: 'DecisionMatrixController',
                        controllerAs: 'vm',
                    }
                },
                params: {
                    analysisId: {
                        value: null,
                        squash: true
                    }
                },
                resolve: {
                    decisionStateInfo: DecisionStateResolver
                        // decisionAnalysisInfo: DecisionAanalysisResolver
                },
            })
            // .state('decisions.single.comparison.analysis', {
            //     url: '/analysis/:analysisId',
            //     templateUrl: 'app/decision/decision.html',
            //     controller: 'DecisionController',
            //     controllerAs: 'vm',
            //     resolve: {
            //         decisionStateInfo: DecisionStateResolver
            //     },
            // })
            .state('decisions.single.parent', {
                url: '/:parentId/{parentSlug}',
                abstract: false,
                views: {
                    "@": {
                        templateUrl: 'app/decision/decision-single-parent.html',
                        controller: 'DecisionSingleParentController',
                        controllerAs: 'vm',
                    }
                },
                params: {
                    parentSlug: {
                        value: null,
                        squash: false
                    }
                }
            });
    }


    // Decision State Data
    DecisionStateResolver.$inject = ['decisionBasicInfo', '$stateParams', '$state', '$rootScope'];

    function DecisionStateResolver(decisionBasicInfo, $stateParams, $state, $rootScope) {

        var result = decisionBasicInfo;
        if (!result) return;

        // SLUG for Decision page firt time call
        var decisionSlug = result.nameSlug ? result.nameSlug : '';

        if ($stateParams.slug === null ||
            $stateParams.slug === 'comparison' ||
            $stateParams.slug === 'list') {
            $stateParams.slug = result.nameSlug;
        }

        // TODO: optimize logic or remove from resolver
        var stateListener = $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams) {
                var
                    currentState,
                    decisionSlug;

                currentState = $state.current.name;

                // TODO: move to app.run.js
                // SLUG for Decision page
                // Always set correct slug from server
                // Just added new slug
                if (toState.name === 'decisions.single') {

                    $state.params.slug = result.nameSlug;
                    $state.transitionTo($state.current.name, toParams, {
                        reload: false,
                        inherit: true,
                        notify: false
                    });
                }

                // TODO: fix it
                // BreadCrumbs
                if ($state.current.name === 'decisions.single.comparison' ||
                    $state.current.name === 'decisions.single.comparison.analysis') {
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
                // if ($state.current.name !== 'decisions' ||
                //     $state.current.name !== 'decisions.single') {
                //     $state.go($state.current.name, {
                //         page: null,
                //         size: null,
                //         sort: null
                //     }, {
                //         notify: false,
                //         reload: false,
                //         location: false
                //     });
                // }

                //unsubscribe event listener
                stateListener();
            });
    }

    // Decision Data
    DecisionResolver.$inject = ['DecisionDataService', '$stateParams', '$state', 'MsgService', '$rootScope'];

    function DecisionResolver(DecisionDataService, $stateParams, $state, msg, $rootScope) {
        var id = $stateParams.id;

        return DecisionDataService.getDecisionInfo(id, $rootScope.decisonViewsCount).then(function(result) {
            if (result.error && result.error.code === 404) {
                console.log(result.error);
                var errorMsg = result.error.code + ': ' + result.error.message;
                msg.error(errorMsg);

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
        if (analysisSlug === 'comparison' && analysisId && analysisId !== 'hall-of-fame') {
            return DecisionDataService.getDecisionAnalysis(analysisId).then(function(resp) {
                if (resp.error) {
                    console.log(resp.error);
                    return;
                }

                // Set analysis obj
                // DecisionSharedService.setFilterObject(resp);

                return resp;
            }, function(req) {
                console.log(req);
            });
        }

    }


})();