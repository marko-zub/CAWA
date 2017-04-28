(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
        .component('matrixCharacteristics', {
            // templateUrl: 'app/components/matrix/matrix-characteristics.html',
            bindings: {
                decisionsIds: '<',
                list: '<'
            },
            controller: 'MatrixCharacteristicsController',
            controllerAs: 'vm',
            template: renderTemplate
        });


    renderTemplate.$inject = ['$element', '$attrs'];

    function renderTemplate($element, $attrs) {
        return [
            '<div class="matrix-g matrix-g-characteristic" ng-repeat="group in vm.listDisplay track by group.characteristicGroupId">',
                '<div class="matrix-item matrix-g-item matrix-item-content">',
                '</div>',
                '<div class="matrix-item matrix-item-content js-matrix-item-content" ng-repeat="item in group.characteristics track by item.characteristicId" >',
                    '<div class="matrix-row">',
                        '<div class="matrix-col matrix-criteria-group" ng-repeat="decisionCol in item.decisionsRow track by decisionCol.uuid" ng-click="vm.getComments($event)">',
                            '<div class="matrix-col-content">',
                                '<content-formater item="::decisionCol.characteristics"></content-formater>',
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


    MatrixCharacteristicsController.$inject = ['DiscussionsNotificationService', '$element', '$compile', '$scope'];

    function MatrixCharacteristicsController(DiscussionsNotificationService, $element, $compile, $scope) {
        var vm = this,
            decisionsIds, decisionsIdsPrev;

        // Discussions
        vm.getComments = getComments;

        // vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        // function onInit() {
        //     if (vm.list) {
        //         vm.listDisplay = vm.list;
        //         decisionsIds = pickDecisionsIds(vm.list);
        //         decisionsIdsPrev = angular.copy(decisionsIds);
        //     }
        // }

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
            vm.isGetCommentsOpen = true;
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }
    }

})();