(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
        .component('matrixCharacteristics', {
            template: renderTemplate,
            bindings: {
                characteristics: '<',
                decisions: '<'
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
                                        '<a ng-href="::" class="control"><i class="glyphicon glyphicon-comment"></i>0</a>',
                                        '<a href="#" class="control readonly"><i class="fa fa-bar-chart" aria-hidden="true"></i> 0</a>',
                                        // '<a href="#" ng-if="::decisionCol.characteristics.totalHistoryValues"><i class="control fa fa-bar-chart" aria-hidden="true"></i></a>',
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
        var vm = this, decisionsIds, decisionsIdsPrev, characteristicsIsInited = false;

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
            // First time init
            // 1. call Decision then 2. call Characteristics
            if(vm.decisions && changes.characteristics && changes.characteristics.currentValue && !characteristicsIsInited) {
                // console.log('characteristics changes');
                vm.characteristicsDisplay = createMatrixContentCharacteristics(vm.decisions);
                decisionsIdsPrev = pickDecisionsIds(vm.decisions);
                characteristicsIsInited = true;
            }

            if(characteristicsIsInited && changes.decisions &&
                changes.decisions.currentValue &&
                !angular.equals(changes.decisions.currentValue, changes.decisions.previousValue)) {

                    // Update only characterisctics for new decision
                    decisionsIds = pickDecisionsIds(changes.decisions.currentValue);
                    // console.log(decisionsIds, decisionsIdsPrev, angular.equals(decisionsIds, decisionsIdsPrev));
                    if(!angular.equals(decisionsIds, decisionsIdsPrev)) {
                        decisionsIdsPrev = angular.copy(decisionsIds);
                        // console.log('Update decisions');
                        vm.decisions = angular.copy(changes.decisions.currentValue);
                        vm.characteristicsDisplay = createMatrixContentCharacteristics(changes.decisions.currentValue);
                    }
            }
        }

        function pickDecisionsIds(decisions) {
            return _.map(decisions, function(item) {
                return item.decision.uid;
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
                vm.isGetCommentsOpen = true;
                DiscussionsNotificationService.notifyOpenDiscussion('data');
                $event.preventDefault();
            // }
        }


        // TODO: clean obj
        function createMatrixContentCharacteristics(decisions) {
            var decisionsCopy = angular.copy(decisions);
            // characteristics
            var characteristicGroupsCopy = angular.copy(vm.characteristics);
            return _.chain(characteristicGroupsCopy).map(function(resultEl) {
                resultEl.characteristics = _.map(resultEl.characteristics, function(characteristicsItem) {
                    characteristicsItem.decisionsRow = createDecisionsRow(decisions, characteristicsItem.id, 'id', 'characteristics');
                    return _.omit(characteristicsItem, 'description', 'createDate', 'name', 'sortable', 'options');
                });
                return _.pick(resultEl, 'id', 'characteristics', 'isClosed');
            }).value();
        }

        function createDecisionsRow(array, id, keyId, property) {
            var arrayCopy = _.clone(array);
            return _.map(arrayCopy, function(item) {
                var obj = _.pick(item, 'decision');
                obj.decision = _.pick(item.decision, 'id', 'nameSlug');
                obj[property] = _.find(item[property], function(findEl) {
                    return findEl[keyId] === id;
                });
                obj[property] = _.omit(obj[property], 'description', 'options', 'filterable', 'sortable');
                obj.uuid = id.toString() + '-' + obj.decision.id.toString();
                return obj;
            });
        }
        // END TODO: try to optimize it
    }

})();