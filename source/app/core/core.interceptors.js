(function() {
    'use strict';

    angular
        .module('app.core')
        .config(configuration);


    configuration.$inject = ['$httpProvider'];

    function configuration($httpProvider) {
        $httpProvider.interceptors.push(appInterceptor);
    }

    appInterceptor.$inject = ['$injector', '$rootScope'];

    function appInterceptor($injector, $rootScope) {
        return {
            request: function(config) {
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

                // Disable analysis
                if (($state.is('decisions.single.categories.comparison') || $state.is('decisions.single.categories.comparison.analysis')) &&
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
                    $state.go('decisions.single.categories.comparison', decisionAnalysisStateParams, {
                        notify: false,
                        reload: false,
                        location: true
                    });
                    // }

                }
                return resp;
            },
            responseError: function(rejection) {

                // $state.go('404');

                var notification = $injector.get('MsgService');
                // var msg = rejection.status + ': ' + rejection.statusText;
                // console.log(rejection);
                if (rejection) {
                    // console.log(rejection);
                    if (rejection.status >= 500 && rejection.status < 600) {
                        const error = {
                            code: '1',
                            message: 'We are aware of service issues and we are working to resolve this asap. Apologies for any inconvenience and thanks for your patience'
                        };
                        $rootScope.errors = [error];
                    }

                    var msg = 'API error' + rejection.status ? ': ' + rejection.status : '';
                    if (rejection.statusText) {
                        msg = msg + ' ' + rejection.statusText;
                    }
                    notification.error(msg);
                }

                return rejection;
            }
        };
    }

})();