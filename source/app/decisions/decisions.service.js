(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('DecisionsService', DecisionsService);

    DecisionsService.$inject = [];

    function DecisionsService() {
    	var service = this;

    	service.data = {
    		totalDecisions: 0
    	};

        service.setCount = function(count) {
        	service.data.totalDecisions = count;
        };

        service.getData = function() {
            return service.data;
        };
    }
})();