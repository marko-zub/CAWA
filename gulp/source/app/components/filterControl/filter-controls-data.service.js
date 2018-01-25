(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('FilterControlsDataService', FilterControlsDataService);

    FilterControlsDataService.$inject = ['DecisionNotificationService'];

    function FilterControlsDataService(DecisionNotificationService) {

        function createFilterQuery(data, optionId) {
            if (!data) return;
            // console.log(data);

            // TODO: clean up 
            // Make constructor for Filter Query
            var sendData = angular.copy(data);
            if (sendData.value === 'all') sendData.value = null;
            // 
            var query = {
                'type': sendData.type || 'AllInQuery',
                'characteristicId': sendData.characteristicId || null,
            };

            var sendVal = (_.isBoolean(sendData.value) || !_.isEmpty(sendData.value)) ? sendData.value : null;
            if (!sendVal && data.optionIds) {
                query.optionIds = data.optionIds;
            } else {
                query.value = sendVal;
            }

            // if (sendData.operator && _.isArray(sendVal)) {
            if (sendData.operator && (_.isArray(sendVal) || _.isArray(query.optionIds))) {
                query.operator = sendData.operator;
                if (sendData.operator === 'OR') {
                    query = {
                        'type': 'AnyInQuery',
                        'characteristicId': sendData.characteristicId || null,
                        'value': sendVal
                    };
                    if (sendVal) {
                        query.value = sendVal;
                    } else if (data.optionIds) {
                        query.optionIds = data.optionIds;
                    } else {
                        query.value = null;
                    }
                }
            }

            if (_.isArray(query.optionIds) && _.isEmpty(query.optionIds)) {
                query.optionIds = null;
            } else if (!_.isEmpty(query.optionIds)) {
                delete query.value;
            }
            characteristicChange(sendData.characteristicId, query, optionId);
        }

        function characteristicChange(characteristicId, query, optionId) {
            if (!characteristicId || !query) return;

            var sendData = {
                query: {
                    'filterQueries': query
                }
            };
            if (optionId >= 0) {
                sendData.optionId = optionId;
            }
            DecisionNotificationService.notifySelectCharacteristic(sendData);
        }

        return {
            createFilterQuery: createFilterQuery,
            characteristicChange: characteristicChange
        };
    }


})();