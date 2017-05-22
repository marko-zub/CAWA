(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('FilterControlsDataService', FilterControlsDataService);

    FilterControlsDataService.$inject = ['DecisionNotificationService', '$filter'];

    function FilterControlsDataService(DecisionNotificationService, $filter) {


        function createFilterQuery(data) {
            if (!data) return;

            // Make constructor for Filter Query
            var sendData = angular.copy(data);
            if (sendData.value === 'all') sendData.value = null;
            var sendVal = (_.isBoolean(sendData.value) || !_.isEmpty(sendData.value)) ? sendData.value : null;
            var query = {
                'type': sendData.type || 'AllInQuery',
                'characteristicId': sendData.characteristicId || null,
                'value': sendVal,
                'operator': sendData.operator
            };
            if (sendData.operator && _.isArray(sendVal)) {
                query.operator = sendData.operator;
                if (sendData.operator === 'OR') {
                    query = {
                        'type': 'AnyInQuery',
                        'characteristicId': sendData.characteristicId || null,
                        'value': sendVal,
                        'operator': sendData.operator
                    };
                }
            }
            characteristicChange(sendData.characteristicId, query);
        }


        function characteristicChange(characteristicId, query) {
            if (!characteristicId || !query) return;
            DecisionNotificationService.notifySelectCharacteristic({
                'filterQueries': query
            });
        }

        return {
            createFilterQuery: createFilterQuery,
            characteristicChange: characteristicChange
        };
    }


})();