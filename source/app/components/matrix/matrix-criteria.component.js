(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCriteriaController', MatrixCriteriaController)
        .component('matrixCriteria', {
            templateUrl: 'app/components/matrix/matrix-criteria.html',
            bindings: {
                list: '<'
            },
            controller: 'MatrixCriteriaController',
            controllerAs: 'vm'
        });


    MatrixCriteriaController.$inject = [];

    function MatrixCriteriaController() {
        var vm = this;

        // Discussions
        vm.isGetCommentsOpen = false;
        vm.getComments = getComments;

        function getComments() {
            vm.isGetCommentsOpen = true;
        }
    }

})();