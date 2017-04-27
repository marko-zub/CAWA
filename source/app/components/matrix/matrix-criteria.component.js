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


    MatrixCriteriaController.$inject = ['DiscussionsNotificationService'];

    function MatrixCriteriaController(DiscussionsNotificationService) {
        var vm = this;

        // Discussions
        vm.getComments = getComments;

        function getComments($event) {
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();