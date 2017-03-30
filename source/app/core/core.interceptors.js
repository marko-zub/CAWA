(function() {
    'use strict';

    angular
        .module('app.core')
        .config(function($httpProvider) {
            $httpProvider.interceptors.push(appInterceptor);
        });

    appInterceptor.$inject = ['$injector'];

    function appInterceptor($injector) {
        // var analysisCallsArr = [];
        return {
            request: function(config) {
                // console.log(config);
                return config;
            },
            response: function(resp) {
                // TODO: optimize move to routes
                // check if decisionAnalysis in response
                // in each API call
                var $state, $stateParams;

                $state = $injector.get('$state');
                $stateParams = $injector.get('$stateParams');

                // if (currentState === 'decisions.matrix' || currentState === 'decisions.matrix.analysis')
                if (($state.is('decisions.single.matrix') || $state.is('decisions.single.matrix.analysis')) &&
                    resp.data && (resp.data.decisionMatrixs || resp.data.decisions) &&
                    resp.data.decisionAnalysisId) {

                    // Save only second call to avoid big array 
                    // TODO: check if we still need this code
                    // if (analysisCallsArr.length === 0 && $stateParams.analysisId) analysisCallsArr.push(decisionAnalysisId);

                    var decisionAnalysisId = resp.data.decisionAnalysisId;
                    // if (analysisCallsArr.length !== 0) {

                        var decisionAnalysisStateParams = {
                            'id': $stateParams.id,
                            'slug': $stateParams.slug,
                            'criteria': $stateParams.criteria,
                            'analysisId': decisionAnalysisId
                        };
                        $state.transitionTo('decisions.single.matrix.analysis', decisionAnalysisStateParams);
                    // }

                }
                return resp;
            },
            responseError: function(rejection) {
                // console.log(rejection);
                return rejection;
            }
        };
    }

})();