(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
        .component('matrixCharacteristics', {
            templateUrl: 'app/components/matrix/matrix-characteristics.html',
            bindings: {
                characteristics: '<',
                decisions: '<'
            },
            controller: 'MatrixCharacteristicsController',
            controllerAs: 'vm'
        });


    MatrixCharacteristicsController.$inject = ['DiscussionsNotificationService'];

    function MatrixCharacteristicsController(DiscussionsNotificationService) {
        var vm = this;

        // Discussions
        vm.getComments = getComments;
        vm.$onChanges = onChanges;

        function onChanges(changes) {
            if(changes.decisions && changes.decisions.currentValue &&
                !angular.equals(changes.decisions.currentValue, changes.decisions.previousValue)) {
                    setDecisions(changes.decisions.currentValue);
            }
        }

        function setDecisions(decisions) {
            var displayDecisions = {};
            _.forEach(decisions, function(decision){

                _.forEach(decision.characteristics, function(characteristic) {
                    var colId = characteristic.id + '-' + decision.decision.id;
                    displayDecisions[colId] = {};
                    displayDecisions[colId].characteristic = characteristic;
                });
            });
            vm.decisionsDisplay = displayDecisions;
        }

        function getComments($event) {
            if(!$($event.target).hasClass('iScrollLoneScrollbar') &&
                !$($event.target).hasClass('link') &&
                !$($event.target).hasClass('link-secondary') &&
                !$($event.target).parents().hasClass('iScrollLoneScrollbar')) {
                vm.isGetCommentsOpen = true;
                DiscussionsNotificationService.notifyOpenDiscussion('data');
                $event.preventDefault();
            }
        }
    }

})();