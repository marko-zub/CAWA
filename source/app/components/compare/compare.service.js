(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('DecisionCompareService', DecisionCompareService);

    DecisionCompareService.$inject = ['Utils', '$localStorage'];

    function DecisionCompareService(Utils, $localStorage) {
        var service = this;
        service.decisions = [];

        // Private
        var saveListStorage = function(array) {
            $localStorage.compare = array;
            service.decisions = array;
        };

        var getListStorage = function() {
            var list = [];
            if (!_.isEmpty($localStorage.compare)) {
                list = $localStorage.compare;
            }
            return list;
        };

        // Public
        service.addItem = function(id, parentId) {
            Utils.addItemToArray(id, service.decisions);
            saveListStorage(service.decisions);
        };

        service.removeItem = function(id) {
            Utils.removeItemFromArray(id, service.decisions);
            saveListStorage(service.decisions);
        };

        service.getList = function() {
            var list = getListStorage();
            saveListStorage(list);
            return service.decisions;
        };

        service.clearList = function() {
            service.decisions = [];
            saveListStorage([]);
        };

    }
})();