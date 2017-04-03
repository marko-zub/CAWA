(function() {

    'user strict';

    angular
        .module('app.decision')
        .controller('DecisionsController', DecisionsController);

    DecisionsController.$inject = ['DecisionDataService', '$sce', '$rootScope'];

    function DecisionsController(DecisionDataService, $sce, $rootScope) {
        var
            vm = this;

        init();

        function init() {

            $rootScope.pageTitle = 'Decisions' + ' | DecisionWanted';

            console.log('Decisions controller');

            DecisionDataService.getDecisions().then(function(result) {
                vm.decisionsList = descriptionTrustHtml(result.decisions);
            });
        }

        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                el.description = $sce.trustAsHtml(el.description);
                return el;
            });
        }
    }
})();