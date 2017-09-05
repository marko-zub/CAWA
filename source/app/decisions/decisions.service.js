(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('DecisionsService', DecisionsService);

    DecisionsService.$inject = ['$rootScope'];

    function DecisionsService($rootScope) {
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