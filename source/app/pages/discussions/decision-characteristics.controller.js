(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('DeicisionCharacteristicsController', DeicisionCharacteristicsController);

    DeicisionCharacteristicsController.$inject = [];

    function DeicisionCharacteristicsController() {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            // console.log('Deicision Characteristics Controller');
        }

    }
})();