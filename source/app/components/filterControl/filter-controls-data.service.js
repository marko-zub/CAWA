(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('FilterControlsDataService', FilterControlsDataService);

    FilterControlsDataService.$inject = ['DecisionNotificationService', '$filter'];

    function FilterControlsDataService(DecisionNotificationService, $filter) {

        function createCompositeQuery(data) {
            if (!data || !_.isArray(data.value)) return;

            var queries;
            if (!_.isEmpty(data.value)) {
                queries = [];
                _.forEach(data.value, function(val) {
                    var queryVal = {
                        "type": "InQuery",
                        "characteristicId": data.characteristicId,
                        "value": val
                    };
                    queries.push(queryVal);
                });

            }


            var query = {
                "type": "CompositeQuery",
                "characteristicId": data.characteristicId,
                "characteristicName": data.characteristicName,
                "operator": "OR",
                "queries": queries
            };
            return query;
        }

        function createFilterQuery(data) {
            if (!data) return;
            // Make constructor for Filter Query
            var sendData = angular.copy(data);
            var sendVal = (_.isBoolean(sendData.value) || !_.isEmpty(sendData.value)) ? sendData.value : null;
            var query = {
                'type': sendData.type || 'AllInQuery',
                'characteristicId': sendData.characteristicId || null,
                'characteristicName': sendData.characteristicName || null,
                'value': sendVal,
            };
            if (sendData.operator && _.isArray(sendVal)) {
                query.operator = sendData.operator;
                if (sendData.operator === 'OR') {
                    // query
                    query = createCompositeQuery(data);
                }
            }
            // console.log(sendData.characteristicId, query);
            characteristicChange(sendData.characteristicId, query);
        }


        function characteristicChange(characteristicId, query) {
            if (!characteristicId || !query) return;
            var filterQueries,
                findIndex,
                sendData;

            sendData = {
                'filterQueries': query
            };
            DecisionNotificationService.notifySelectCharacteristic(sendData);
        }

        return {
            createFilterQuery: createFilterQuery,
            characteristicChange: characteristicChange
        };
    }


})();