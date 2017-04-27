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
        var vm = this;

        // vm.$onInit = onInit;
        // function onInit() {
        //     console.log('init');
        //     console.log(vm.list);
        // }
        vm.listReady = false;
        vm.$onChanges = onChanges;
        function onChanges() {

            // console.log(vm.list);
            if(vm.list && vm.list.length) vm.listReady = true;
        }

        // Discussions
        vm.getComments = getComments;

        function getComments($event) {
            vm.isGetCommentsOpen = true;
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();