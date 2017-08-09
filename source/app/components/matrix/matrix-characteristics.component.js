(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
        .component('matrixCharacteristics', {
            templateUrl: 'app/components/matrix/matrix-characteristics.html',
            bindings: {
                characteristics: '<',
                decisions: '<',
                characteristicLimit: '<'
            },
            controller: 'MatrixCharacteristicsController',
            controllerAs: 'vm'
        });


    MatrixCharacteristicsController.$inject = ['DiscussionsNotificationService', 'ContentFormaterService'];

    function MatrixCharacteristicsController(DiscussionsNotificationService, ContentFormaterService) {
        var vm = this, decisionsIds, decisionsIdsPrev, characteristicsIsInited = false;

        // Discussions
        vm.getComments = getComments;
        // vm.renderContent = ContentFormaterService.getTemplate;

        // vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        // function onInit() {
        //     if (vm.characteristics) {
        //         vm.characteristicsDisplay = angular.copy(vm.characteristics);
        //         decisionsIds = pickDecisionsIds(vm.characteristics);
        //         decisionsIdsPrev = angular.copy(decisionsIds);
        //     }
        // }

        function onChanges(changes) {
            if(changes.characteristicLimit &&
                !angular.equals(changes.characteristicLimit.currentValue, changes.characteristicLimit.previousValue)) {
                vm.characteristicLimit = changes.characteristicLimit.currentValue;
            }

            // First time init
            // 1. call Decision then 2. call Characteristics
            // if(vm.decisions && changes.characteristics && changes.characteristics.currentValue && !characteristicsIsInited) {
            //     // console.log('characteristics changes');
            //     vm.characteristicsDisplay = createMatrixContentCharacteristics(vm.decisions);
            //     decisionsIdsPrev = pickDecisionsIds(vm.decisions);
            //     characteristicsIsInited = true;
            // }

            if(changes.decisions && changes.decisions.currentValue &&
                !angular.equals(changes.decisions.currentValue, changes.decisions.previousValue)) {
                    setDecisions(changes.decisions.currentValue);
            }

            // if(characteristicsIsInited && changes.decisions &&
            //     changes.decisions.currentValue &&
            //     !angular.equals(changes.decisions.currentValue, changes.decisions.previousValue)) {

            //         // Update only characterisctics for new decision
            //         decisionsIds = pickDecisionsIds(changes.decisions.currentValue);
            //         // console.log(decisionsIds, decisionsIdsPrev, angular.equals(decisionsIds, decisionsIdsPrev));
            //         if(!angular.equals(decisionsIds, decisionsIdsPrev)) {
            //             decisionsIdsPrev = angular.copy(decisionsIds);
            //             // console.log('Update decisions');
            //             vm.decisions = angular.copy(changes.decisions.currentValue);
            //             vm.characteristicsDisplay = createMatrixContentCharacteristics(changes.decisions.currentValue);
            //         }
            // }
        }

        function setDecisions(decisions) {
            // console.log(decisions);
            // console.log(vm.characteristics);
            var displayDecisions = {};
            _.forEach(decisions, function(decision){

                _.forEach(decision.characteristics, function(characteristic) {
                    var colId = characteristic.id + '-' + decision.decision.id;
                    displayDecisions[colId] = {};
                    displayDecisions[colId].characteristic = characteristic;
                    // displayDecisions[colId].characteristic.html = ContentFormaterService.getTemplate(characteristic.value, characteristic)
                });
            });
            vm.decisionsDisplay = displayDecisions;
        }

        function pickDecisionsIds(decisions) {
            return _.map(decisions, function(item) {
                return item.decision.id;
            });
        }

        function getComments($event) {

            // if($($event.target).hasClass('control') ||
            //     $($event.target).parents().hasClass('control') ||
            //     $($event.target).hasClass('link-secondary')) {
            //     $event.stopPropagation();
            //     $event.preventDefault();
            //     console.log('c');
            // } else {

            if(!$($event.target).hasClass('iScrollLoneScrollbar') &&
                !$($event.target).hasClass('link') &&
                !$($event.target).hasClass('link-secondary') &&
                !$($event.target).parents().hasClass('iScrollLoneScrollbar')) {
                vm.isGetCommentsOpen = true;
                DiscussionsNotificationService.notifyOpenDiscussion('data');
                $event.preventDefault();
            }
        }


        // TODO: clean obj
        // function createMatrixContentCharacteristics(decisions) {
        //     var decisionsCopy = angular.copy(decisions);
        //     // characteristics
        //     // var characteristicGroupsCopy = angular.copy(vm.characteristics);

        //     console.log(decisionsCopy);
        //     console.log(characteristicGroupsCopy);
        //     return _.chain(characteristicGroupsCopy).map(function(resultEl) {
        //         resultEl.characteristics = _.map(resultEl.characteristics, function(characteristicsItem) {
        //             characteristicsItem.decisionsRow = createDecisionsRow(decisions, characteristicsItem.id, 'id', 'characteristics');
        //             return _.omit(characteristicsItem, 'description', 'createDate', 'name', 'sortable', 'options');
        //         });
        //         return _.pick(resultEl, 'id', 'characteristics', 'isClosed');
        //     }).value();
        // }

        // function createDecisionsRow(array, id, keyId, property) {
        //     var arrayCopy = _.clone(array);
        //     return _.map(arrayCopy, function(item) {
        //         var obj = _.pick(item, 'decision');
        //         obj.decision = _.pick(item.decision, 'id', 'nameSlug');
        //         obj[property] = _.find(item[property], function(findEl) {
        //             return findEl[keyId] === id;
        //         });
        //         obj[property] = _.omit(obj[property], 'description', 'options', 'filterable', 'sortable');
        //         obj.uuid = id.toString() + '-' + obj.decision.id.toString();
        //         return obj;
        //     });
        // }
        // END TODO: try to optimize it
    }

})();