(function() {

    'use strict';

    angular
        .module('app.decision')
        .factory('DecisionNotificationService', DecisionNotificationService);

    DecisionNotificationService.$inject = ['$rootScope'];

    function DecisionNotificationService($rootScope) {

        var listeners = {};

        var service = {
            subscribeSelectSorter: subscribeSelectSorter,
            subscribeSelectCriteria: subscribeSelectCriteria,
            subscribeSelectDecision: subscribeSelectDecision,
            subscribeSelectCharacteristic: subscribeSelectCharacteristic,
            subscribeGetDetailedCharacteristics: subscribeGetDetailedCharacteristics,
            subscribeCharacteristicsGroups: subscribeCharacteristicsGroups,
            subscribePageChanged: subscribePageChanged,
            subscribeChildDecisionExclusion: subscribeChildDecisionExclusion,
            subscribeFilterTags: subscribeFilterTags,
            subscribeFilterByName: subscribeFilterByName,
            notifyGetDetailedCharacteristics: notifyGetDetailedCharacteristics,
            notifySelectCriteria: notifySelectCriteria,
            notifySelectDecision: notifySelectDecision,
            notifySelectCharacteristic: notifySelectCharacteristic,
            notifyCharacteristicsGroups: notifyCharacteristicsGroups,
            notifyPageChanged: notifyPageChanged,
            notifyInitSorter: notifyInitSorter,
            notifyChildDecisionExclusion: notifyChildDecisionExclusion,
            notifyFilterTags: notifyFilterTags,
            notifyFilterByName: notifyFilterByName
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
        function subscribeSelectSorter(callback) {
            subscribe('selectSorter', callback);
        }

        function subscribeSelectCriteria(callback) {
            subscribe('selectCriteria', callback);
        }

        function subscribeSelectDecision(callback) {
            subscribe('selectDecision', callback);
        }

        function subscribeSelectCharacteristic(callback) {
            subscribe('selectCharacteristic', callback);
        }

        function subscribeGetDetailedCharacteristics(callback) {
            subscribe('getDetailedCharacteristics', callback);
        }

        function subscribeCharacteristicsGroups(callback) {
            subscribe('characteristicsGroups', callback);
        }

        function subscribePageChanged(callback) {
            subscribe('pageChanged', callback);
        }

        function subscribeChildDecisionExclusion(callback) {
            subscribe('decisionExclusionChanged', callback);
        }

        function subscribeFilterTags(callback) {
            subscribe('queryFilterChanged', callback);
        }

        function subscribeFilterByName(callback) {
            subscribe('queryFilterByNameChanged', callback);
        }

        // Emitters
        function notifyGetDetailedCharacteristics(data) {
            emit('getDetailedCharacteristics', data);
        }

        function notifySelectCriteria(data) {
            emit('selectCriteria', data);
        }

        function notifySelectDecision(data) {
            emit('selectDecision', data);
        }

        function notifySelectCharacteristic(data) {
            emit('selectCharacteristic', data);
        }

        function notifyCharacteristicsGroups(data) {
            emit('characteristicsGroups', data);
        }

        function notifyPageChanged(data) {
            emit('pageChanged', data);
        }

        function notifyInitSorter(data) {
            broadcast('initSorter', data);
        }

        function notifyChildDecisionExclusion(data) {
            emit('decisionExclusionChanged', data);
        }

        function notifyFilterTags(data) {
            emit('queryFilterChanged', data);
        }

        function notifyFilterByName(data) {
            emit('queryFilterByNameChanged', data);
        }

    }
})();