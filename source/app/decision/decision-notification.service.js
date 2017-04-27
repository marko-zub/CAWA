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
            subscribeSelectCriterion: subscribeSelectCriterion,
            subscribeSelectDecision: subscribeSelectDecision,
            subscribeSelectCharacteristic: subscribeSelectCharacteristic,
            subscribeGetDetailedCharacteristics: subscribeGetDetailedCharacteristics,
            subscribeCharacteristicsGroups: subscribeCharacteristicsGroups,
            subscribePageChanged: subscribePageChanged,
            subscribeChildDecisionExclusion: subscribeChildDecisionExclusion,
            notifyGetDetailedCharacteristics: notifyGetDetailedCharacteristics,
            notifySelectCriterion: notifySelectCriterion,
            notifySelectDecision: notifySelectDecision,
            notifySelectCharacteristic: notifySelectCharacteristic,
            notifyCharacteristicsGroups: notifyCharacteristicsGroups,
            notifyPageChanged: notifyPageChanged,
            notifyInitSorter: notifyInitSorter,
            notifyChildDecisionExclusion: notifyChildDecisionExclusion
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

        function subscribeSelectCriterion(callback) {
            subscribe('selectCriterion', callback);
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

        // Emitters
        function notifyGetDetailedCharacteristics(data) {
            emit('getDetailedCharacteristics', data);
        }

        function notifySelectCriterion(data) {
            emit('selectCriterion', data);
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

    }
})();
