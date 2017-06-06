(function() {
    'use strict';

    angular
        .module('app.core')
        .config(configuration);


    configuration.$inject = ['$httpProvider'];

    function configuration($httpProvider) {
        $httpProvider.interceptors.push(appInterceptor);
    }

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

                // Disable analysis
                // if (($state.is('decisions.single.comparison') || $state.is('decisions.single.comparison.analysis')) &&
                //     resp.data && (resp.data.decisionMatrixs || resp.data.decisions) &&
                //     resp.data.decisionAnalysisId) {

                //     // Save only second call to avoid big array
                //     // TODO: check if we still need this code
                //     // if (analysisCallsArr.length === 0 && $stateParams.analysisId) analysisCallsArr.push(decisionAnalysisId);

                //     var decisionAnalysisId = resp.data.decisionAnalysisId;
                //     // if (analysisCallsArr.length !== 0) {

                //     var decisionAnalysisStateParams = {
                //         'id': $stateParams.id,
                //         'slug': $stateParams.slug,
                //         'criteria': $stateParams.criteria,
                //         'analysisId': decisionAnalysisId
                //     };
                //     $state.go('decisions.single.comparison.analysis', decisionAnalysisStateParams, {
                //         notify: false,
                //         reload: false,
                //         location: true
                //     });
                //     // }

                // }
                return resp;
            },
            responseError: function(rejection) {
                console.log(rejection);
                // $state.go('404');

                var notification = $injector.get('MsgService');
                var msg = ''//rejection.status + ': ' + rejection.statusText;
                if(rejection.status === -1)
                    notification.error('No API connection ' + rejection.statusText);  

                return rejection;
            }
        };
    }

})();