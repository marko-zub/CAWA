(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
        .component('matrixCharacteristics', {
            template: renderTemplate,
            bindings: {
                list: '<'
            },
            controller: 'MatrixCharacteristicsController',
            controllerAs: 'vm'
        });


    renderTemplate.$inject = [];

    function renderTemplate() {
        return [
            '<div class="matrix-g matrix-g-characteristic" ng-repeat="group in vm.listDisplay track by group.characteristicGroupId">',
                '<div class="matrix-item matrix-g-item matrix-item-content">',
                '</div>',
                '<div class="matrix-item matrix-item-content js-matrix-item-content" ng-repeat="item in group.characteristics track by item.characteristicId" ng-class="{\'hide\': group.isClosed}">',
                    '<div class="matrix-row">',
                        '<div class="matrix-col matrix-criteria-group" ng-repeat="decisionCol in item.decisionsRow track by decisionCol.uuid" ng-click="vm.getComments($event)">',
                            '<div class="matrix-col-content">',
                                '<content-formater ng-if="::decisionCol.characteristics" item="::decisionCol.characteristics"></content-formater>',
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

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            if (vm.list) {
                vm.listDisplay = angular.copy(vm.list);
                decisionsIds = pickDecisionsIds(vm.list);
                decisionsIdsPrev = angular.copy(decisionsIds);
            }
        }

        function onChanges(changes) {
            if(changes.list.currentValue) {
                decisionsIds = pickDecisionsIds(changes.list.currentValue);
            }

            // Update only when decisions ids changes
            if (changes.list.currentValue &&
                !angular.equals(decisionsIds, decisionsIdsPrev)) {
                vm.listDisplay = changes.list.currentValue;
                decisionsIdsPrev = angular.copy(decisionsIds);
            }
        }

        function pickDecisionsIds(list) {
            var copy = angular.copy(list[0].characteristics[0].decisionsRow);
            return _.map(copy, function(item) {
                return item.decision.decisionId;
            });
        }

        function getComments($event) {
            // if(!$($event.target).hasClass('link-secondary')) {
            vm.isGetCommentsOpen = true;
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();