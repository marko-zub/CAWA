(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
        .component('matrixCharacteristics', {
            templateUrl: 'app/components/matrix/matrix-characteristics.html',
            bindings: {
                list: '<'
            },
            controller: 'MatrixCharacteristicsController',
            controllerAs: 'vm'
        });


    MatrixCharacteristicsController.$inject = [];

    function MatrixCharacteristicsController() {
        var vm = this;
    }

})();