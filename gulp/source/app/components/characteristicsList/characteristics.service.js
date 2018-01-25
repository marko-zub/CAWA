(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('CharacteristicsService', CharacteristicsService);

    CharacteristicsService.$inject = [];

    function CharacteristicsService() {
        // var service = this;

        function filterCharacteristicsList(list) {
            return _.filter(list, function(group) {
                group.characteristics = _.filter(group.characteristics, function(characteristic) {
                    return characteristic.display;
                });
                return group;
            });
        }

        return {
            filterCharacteristicsList: filterCharacteristicsList
        };
    }
})();