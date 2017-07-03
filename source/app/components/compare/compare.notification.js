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

            // Notify
            notifyUpdateDecisionCompare: notifyUpdateDecisionCompare,
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

        // Emitters
        function notifyUpdateDecisionCompare(data) {
            emit('updateDecisionCompareList', data);
        }

    }
})();