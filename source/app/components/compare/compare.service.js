(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('DecisionCompareService', DecisionCompareService);

    DecisionCompareService.$inject = ['Utils'];

    function DecisionCompareService(Utils) {
        var service = this;

        var decisionsList = [];

        service.decisions = decisionsList;

        service.addItem = function(id) {
            Utils.addItemToArray(id, service.decisions);
            // console.log(service.decisions);
        };

        service.removeItem = function(id) {
            Utils.removeItemFromArray(id, service.decisions);
        };

        service.getList = function() {
            return service.decisions;
        };

        service.clear = function() {
            service.decisionsList = [];
        };
    }
})();