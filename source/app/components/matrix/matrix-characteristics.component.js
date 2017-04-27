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


    MatrixCharacteristicsController.$inject = ['DiscussionsNotificationService'];

    function MatrixCharacteristicsController(DiscussionsNotificationService) {
        var vm = this, prevList;
        
        // Discussions
        vm.getComments = getComments;

        function getComments($event) {
            vm.isGetCommentsOpen = true;
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();