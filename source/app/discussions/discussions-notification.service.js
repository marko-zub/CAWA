(function() {

    'use strict';

    angular
        .module('app.discussions')
        .factory('DiscussionsNotificationService', DiscussionsNotificationService);

    DiscussionsNotificationService.$inject = ['$rootScope'];

    function DiscussionsNotificationService($rootScope) {

        var listeners = {};

        var service = {
            subscribeOpenDiscussion: subscribeOpenDiscussion,
            notifyOpenDiscussion: notifyOpenDiscussion
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

        function subscribeOpenDiscussion(callback) {
            subscribe('OpenDiscussion', callback);
        }

        // Emitters
        function notifyOpenDiscussion(data) {
            broadcast('OpenDiscussion', data);
        }

    }
})();
