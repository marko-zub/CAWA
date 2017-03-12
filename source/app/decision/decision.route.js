(function() {

    'use strict';

    angular
        .module('app.decision')
        .config(configuration);

    configuration.$inject = ['$stateProvider'];

    function configuration($stateProvider) {
        $stateProvider
            .state('decisions', {
                abstract: true,
                url: '/decisions',
                template: '<ui-view/>'
            })
            .state('decisions.matrix', {
                url: '/:id/{slug}/{criteria}/matrix', //Url rewrites in resolver
                templateUrl: 'app/desicionMatrix/decision-matrix.html',
                controller: 'DecisionMatrixController',
                controllerAs: 'vm',
                resolve: {
                    decisionBasicInfo: DecisionResolver,
                    decisionAnalysisInfo: DecisionAanalysisResolver
                },
                params: {
                    slug: {
                        value: null,
                        squash: true
                    },
                    criteria: {
                        value: null,
                        squash: true
                    }
                }
            })
            .state('decisions.matrix.analysis', {
                url: '/analysis/:analysisId',
                templateUrl: 'app/decision/decision.html',
                controller: 'DecisionController',
                controllerAs: 'vm',
                resolve: {
                    // decisionAnalysisInfo: DecisionAanalysisResolver
                },
            })
            .state('decisions.list', {
                url: '/:id/{slug}/{criteria}/list',
                templateUrl: 'app/decision/decision.html',
                controller: 'DecisionController',
                controllerAs: 'vm',
                resolve: {
                    decisionBasicInfo: DecisionResolver
                },
                params: {
                    slug: {
                        value: null,
                        squash: true
                    },
                    criteria: {
                        value: null,
                        squash: true
                    }
                }
            })
            .state('decisions.list.analysis', {
                url: '/analysis/:analysisId',
                templateUrl: 'app/decision/decision.html',
                controller: 'DecisionController',
                controllerAs: 'vm',
                resolve: {
                    // decisionAnalysisInfo: DecisionAanalysisResolver
                },
            });
    }

    // Decision Data
    DecisionResolver.$inject = ['DecisionDataService', '$stateParams', '$state', '$rootScope', '$location'];

    function DecisionResolver(DecisionDataService, $stateParams, $state, $rootScope, $location) {
        return DecisionDataService.getDecisionInfo($stateParams.id).then(function(result) {
            if (result.error && result.error.code === 404) {
                console.log(result.error);
                $state.go('404');
            }
            var stateListener = $rootScope.$on('$stateChangeSuccess',
                function(event, toState, toParams, fromState, fromParams) {
                    // TODO: share data with Criteria and Characteristics Avoid additional API calls
                    var
                        currentState,
                        criteria = '',
                        decisionSlug;

                    currentState = $state.current.name;

                    //SLUG for Decision page
                    //Always set correct slug from server

                    decisionSlug = result.nameSlug ? result.nameSlug : '';

                    $stateParams.slug = result.nameSlug;
                    //set criteria ( addtional user parameters)
                    if (toParams.criteria && (!fromParams.id || toParams.id === fromParams.id)) {
                        criteria = toParams.criteria;
                    }

                    // TODO: remove
                    var decisionStateParams = {
                        'id': toParams.id,
                        'slug': decisionSlug,
                        'criteria': criteria
                    };
                    if (toState.name === 'decisions.matrix' || toState.name === 'decisions.list') {
                        // Just added new slug
                        $state.go(currentState, decisionStateParams);
                    }

                    //unsubscribe event listener
                    stateListener();
                });
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