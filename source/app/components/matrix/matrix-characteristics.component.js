(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
        .component('matrixCharacteristics', {
            template: renderTemplate,
            bindings: {
                characteristics: '<'
            },
            controller: 'MatrixCharacteristicsController',
            controllerAs: 'vm'
        });


    renderTemplate.$inject = [];

    function renderTemplate() {
        return [
            '<div class="matrix-g matrix-g-characteristics" data-characteristic-group="{{::group.id}}" ng-repeat="group in vm.characteristicsDisplay track by group.id">',
                '<div class="matrix-item matrix-g-item matrix-item-content">',
                '</div>',
                '<div class="matrix-item matrix-item-content js-matrix-item-content js-toggle-hide" ng-repeat="item in group.characteristics track by item.id">',
                    '<div class="matrix-row">',
                        '<div class="matrix-col matrix-criteria-group" ng-repeat="decisionCol in item.decisionsRow track by decisionCol.uuid" ng-click="vm.getComments($event)">',
                            '<div class="matrix-col-content">',
                                '<content-formater ng-if="::decisionCol.characteristics.value" value="::decisionCol.characteristics.value" type="::item.valueType"></content-formater>',
                                '<div class="app-item-additional-wrapper">',
                                    '<div class="app-item-comments">',
                                        '<span class="glyphicon glyphicon-comment"></span>0',
                                    '</div>',
                                '</div>',
                                '</a>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('\n');
    }


    MatrixCharacteristicsController.$inject = ['DiscussionsNotificationService'];

    function MatrixCharacteristicsController(DiscussionsNotificationService) {
        var vm = this, decisionsIds, decisionsIdsPrev;

        // Discussions
        vm.getComments = getComments;

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
            if(changes.characteristics.currentValue) {
                decisionsIds = pickDecisionsIds(changes.characteristics.currentValue);
            }

            // Update only when decisions ids changes
            if (changes.characteristics.currentValue &&
                !angular.equals(decisionsIds, decisionsIdsPrev)) {
                vm.characteristicsDisplay = changes.characteristics.currentValue;
                decisionsIdsPrev = angular.copy(decisionsIds);
            }
        }

        function pickDecisionsIds(characteristics) {
            var copy = angular.copy(characteristics[0].characteristics[0].decisionsRow);
            return _.map(copy, function(item) {
                return item.decision.id;
            });
        }

        function getComments($event) {
            // console.log($event.target);
            // if(!$($event.target).hasClass('link-secondary')) {
            vm.isGetCommentsOpen = true;
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();