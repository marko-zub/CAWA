(function() {

    'use strict';

    angular
        .module('app.decision')
        .factory('DecisionCompareNotificationService', DecisionCompareNotificationService);

    DecisionCompareNotificationService.$inject = ['$rootScope'];

    function DecisionCompareNotificationService($rootScope) {

        var listeners = {};

        var service = {
            // Subscribe
            subscribeUpdateDecisionCompare: subscribeUpdateDecisionCompare,
            subscribeRemoveDecisionCompare: subscribeRemoveDecisionCompare,

            // Notify
            notifyUpdateDecisionCompare: notifyUpdateDecisionCompare,
            notifyRemoveDecisionCompare: notifyRemoveDecisionCompare,
        };

        return service;

        //Basic
        function subscribe(event, callback) {
            if (listeners[event]) {
                listeners[event]();
            }
            listeners[event] = $rootScope.$on(event, callback);
        }

        function broadcast(event, data) {
            $rootScope.$broadcast(event, data);
        }

        function emit(event, data) {
            $rootScope.$emit(event, data);
        }

        // Listeners
        function subscribeUpdateDecisionCompare(callback) {
            subscribe('updateDecisionCompareList', callback);
        }
        function subscribeRemoveDecisionCompare(callback) {
            subscribe('removeDecisionCompareList', callback);
        }        

        // Emitters
        function notifyUpdateDecisionCompare(data) {
            emit('updateDecisionCompareList', data);
        }
        function notifyRemoveDecisionCompare(data) {
            broadcast('removeDecisionCompareList', data);
        }        

    }
})();