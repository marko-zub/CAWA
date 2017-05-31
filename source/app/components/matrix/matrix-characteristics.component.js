// (function() {

//     'use strict';

//     angular
//         .module('app.components')
//         .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
//         .component('matrixCharacteristics', {
//             template: renderTemplate,
//             bindings: {
//                 characteristics: '<',
//                 decisions: '<'
//             },
//             controller: 'MatrixCharacteristicsController',
//             controllerAs: 'vm'
//         });


//     renderTemplate.$inject = [];

//     function renderTemplate() {
//         return [
//             '<div class="matrix-g matrix-g-characteristics" data-characteristic-group="{{::group.id}}" ng-repeat="group in vm.characteristicsDisplay track by group.id">',
//                 '<div class="matrix-item matrix-g-item matrix-item-content">',
//                 '</div>',
//                 '<div class="matrix-item matrix-item-content js-matrix-item-content js-toggle-hide" ng-repeat="item in group.characteristics track by item.id">',
//                     '<div class="matrix-row">',
//                         '<div class="matrix-col matrix-criteria-group" ng-repeat="decisionCol in item.decisionsRow track by decisionCol.uuid" ng-click="vm.getComments($event)">',
//                             '<div class="matrix-col-content">',
//                                 '<content-formater ng-if="::decisionCol.characteristics.value" value="::decisionCol.characteristics.value" type="::item.valueType"></content-formater>',
//                                 '<div class="app-item-additional-wrapper app-item-comments">',
//                                     '<a ng-href="::" class="control"><i class="glyphicon glyphicon-comment"></i>0</a>',
//                                     '<a href="#" class="control readonly"><i class="fa fa-bar-chart" aria-hidden="true"></i> 0</a>',
//                                     // '<a href="#" ng-if="::decisionCol.characteristics.totalHistoryValues"><i class="control fa fa-bar-chart" aria-hidden="true"></i></a>',
//                                 '</div>',
//                                 '</a>',
//                             '</div>',
//                         '</div>',
//                     '</div>',
//                 '</div>',
//             '</div>'
//         ].join('\n');
//     }


//     MatrixCharacteristicsController.$inject = ['DiscussionsNotificationService'];

//     function MatrixCharacteristicsController(DiscussionsNotificationService) {
//         var vm = this, decisionsIds, decisionsIdsPrev, characteristicsIsInited = false;

//         // Discussions
//         vm.getComments = getComments;

//         // vm.$onInit = onInit;
//         vm.$onChanges = onChanges;

//         // function onInit() {
//         //     if (vm.characteristics) {
//         //         vm.characteristicsDisplay = angular.copy(vm.characteristics);
//         //         decisionsIds = pickDecisionsIds(vm.characteristics);
//         //         decisionsIdsPrev = angular.copy(decisionsIds);
//         //     }
//         // }

//         function onChanges(changes) {
//             // First time init
//             // 1. call Decision then 2. call Characteristics
//             if(vm.decisions && changes.characteristics && changes.characteristics.currentValue && !characteristicsIsInited) {
//                 // console.log('characteristics changes');
//                 vm.characteristicsDisplay = createMatrixContentCharacteristics(vm.decisions);
//                 decisionsIdsPrev = pickDecisionsIds(vm.decisions);
//                 characteristicsIsInited = true;
//             }

//             if(characteristicsIsInited && changes.decisions &&
//                 changes.decisions.currentValue &&
//                 !angular.equals(changes.decisions.currentValue, changes.decisions.previousValue)) {

//                     // Update only characterisctics for new decision
//                     decisionsIds = pickDecisionsIds(changes.decisions.currentValue);
//                     // console.log(decisionsIds, decisionsIdsPrev, angular.equals(decisionsIds, decisionsIdsPrev));
//                     if(!angular.equals(decisionsIds, decisionsIdsPrev)) {
//                         decisionsIdsPrev = angular.copy(decisionsIds);
//                         // console.log('Update decisions');
//                         vm.decisions = angular.copy(changes.decisions.currentValue);
//                         vm.characteristicsDisplay = createMatrixContentCharacteristics(changes.decisions.currentValue);
//                     }
//             }
//         }

//         function pickDecisionsIds(decisions) {
//             return _.map(decisions, function(item) {
//                 return item.decision.uid;
//             });
//         }

//         function getComments($event) {

//             // if($($event.target).hasClass('control') ||
//             //     $($event.target).parents().hasClass('control') ||
//             //     $($event.target).hasClass('link-secondary')) {
//             //     $event.stopPropagation();
//             //     $event.preventDefault();
//             //     console.log('c');
//             // } else {

//             if(!$($event.target).hasClass('iScrollLoneScrollbar') &&
//                 !$($event.target).hasClass('link-secondary') &&
//                 !$($event.target).parents().hasClass('iScrollLoneScrollbar')) {
//                 vm.isGetCommentsOpen = true;
//                 DiscussionsNotificationService.notifyOpenDiscussion('data');
//                 $event.preventDefault();
//             }
//         }


//         // TODO: clean obj
//         function createMatrixContentCharacteristics(decisions) {
//             var decisionsCopy = angular.copy(decisions);
//             // characteristics
//             var characteristicGroupsCopy = angular.copy(vm.characteristics);
//             return _.chain(characteristicGroupsCopy).map(function(resultEl) {
//                 resultEl.characteristics = _.map(resultEl.characteristics, function(characteristicsItem) {
//                     characteristicsItem.decisionsRow = createDecisionsRow(decisions, characteristicsItem.id, 'id', 'characteristics');
//                     return _.omit(characteristicsItem, 'description', 'createDate', 'name', 'sortable', 'options');
//                 });
//                 return _.pick(resultEl, 'id', 'characteristics', 'isClosed');
//             }).value();
//         }

//         function createDecisionsRow(array, id, keyId, property) {
//             var arrayCopy = _.clone(array);
//             return _.map(arrayCopy, function(item) {
//                 var obj = _.pick(item, 'decision');
//                 obj.decision = _.pick(item.decision, 'id', 'nameSlug');
//                 obj[property] = _.find(item[property], function(findEl) {
//                     return findEl[keyId] === id;
//                 });
//                 obj[property] = _.omit(obj[property], 'description', 'options', 'filterable', 'sortable');
//                 obj.uuid = id.toString() + '-' + obj.decision.id.toString();
//                 return obj;
//             });
//         }
//         // END TODO: try to optimize it
//     }

// })();


(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
        .component('matrixCharacteristics', {
            // template: renderTemplate,
            bindings: {
                decisions: '<',
                characteristics: '<'
            },
            controller: 'MatrixCharacteristicsController',
            controllerAs: 'vm'
        });


    // renderTemplate.$inject = [];

    // function renderTemplate() {
    //     return [
    //         '<div class="matrix-g matrix-g-characteristic" ng-repeat="group in vm.characteristicsDisplay track by group.id">',
    //             '<div class="matrix-item matrix-g-item matrix-item-content">',
    //             '</div>',
    //             '<div class="matrix-item matrix-item-content js-matrix-item-content" ng-repeat="item in group.characteristics track by item.id" ng-class="{\'hide\': group.isClosed}">',
    //                 '<div class="matrix-row">',
    //                     '<div class="matrix-col matrix-characteristics-group" ng-repeat="decisionCol in item.decisionsRow track by decisionCol.uuid" ng-click="vm.getComments($event)">',
    //                         '<div class="matrix-col-content">',
    //                             '<content-formater ng-if="::decisionCol.characteristics" value="::decisionCol.characteristics.value" type="::item.valueType"></content-formater>',
    //                             '<div class="app-item-additional-wrapper">',
    //                                 '<div class="app-item-comments">',
    //                                     '<span class="glyphicon glyphicon-comment"></span>0',
    //                                 '</div>',
    //                             '</div>',
    //                             '</a>',
    //                         '</div>',
    //                     '</div>',
    //                 '</div>',
    //             '</div>',
    //         '</div>'
    //     ].join('\n');
    // }


    MatrixCharacteristicsController.$inject = ['DiscussionsNotificationService', '$element', '$scope', '$compile', 'ContentFormaterService'];

    function MatrixCharacteristicsController(DiscussionsNotificationService, $element, $scope, $compile, ContentFormaterService) {
        var vm = this, decisionsIds, decisionsIdsPrev;

        // Discussions
        vm.getComments = getComments;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            // if (vm.characteristics) {
            //     vm.characteristicsDisplay = angular.copy(vm.characteristics);
            //     decisionsIds = pickDecisionsIds(vm.characteristics);
            //     decisionsIdsPrev = angular.copy(decisionsIds);
            // }
        }

        function onChanges(changes) {
            // console.log(changes);
            // Decision call before characteristics for optimization render

            // First change
            if(vm.decisions && changes.characteristics && !changes.characteristics.previousValue) {
                generateBaseGrid(changes.characteristics.currentValue);
                generateCharacteristicsMatrix(vm.decisions);
            } 

            if (changes.decisions && changes.decisions.currentValue) {
                // if first changes and not changed size of decision 
                // Generate base html
                if(!changes.decisions.previousValue || 
                    changes.decisions.currentValue.length !== changes.decisions.previousValue.length) {
                    generateBaseGrid(vm.characteristics);
                }
                if(!angular.equals(changes.decisions.currentValue, changes.decisions.previousValue)) {
                    generateCharacteristicsMatrix(changes.decisions.currentValue); 
                } 
            }        
  
        }

        function pickDecisionsIds(characteristics) {
            var copy = angular.copy(characteristics[0].characteristics[0].decisionsRow);
            return _.map(copy, function(item) {
                return item.decision.id;
            });
        }

        function getComments($event) {
            if(!$($event.target).hasClass('iScrollLoneScrollbar') &&
                !$($event.target).hasClass('link-secondary') &&
                !$($event.target).parents().hasClass('iScrollLoneScrollbar')) {
                vm.isGetCommentsOpen = true;
                DiscussionsNotificationService.notifyOpenDiscussion('data');
                $event.preventDefault();
            }
        }

        // Render characteristics

        var emptyCol = [
            '<div class="content"></div>',
            '<div class="app-item-additional-wrapper">',
                '<a class="app-item-comments link-secondary" href="#">',
                    '<span class="glyphicon glyphicon-comment"></span>0',
                '</a>',
            '</div>'
        ].join('\n');

        function generateDecisionsRow(decisions, id, valueType) {
            var html = [];
            _.forEach(decisions, function(decision, decisionIndex) {
                var col = [
                    '<div class="m-group-col-static" data-value-type="' + valueType + '" id="m-characteristics-' + decisionIndex + '-' + id +'" style="left: ' + decisionIndex * 200 + 'px" ng-click="vm.getComments($event)">',
                    '</div>'
                ].join('\n');
                html.push(col);
            });
            // debugger
            return html.join('\n');
        }

        function generateBaseGrid(list) {
            var html = [];
            // console.log(list);
            _.forEach(list, function(container) {

               // Rows
               var rows = [];
                _.forEach(container.characteristics, function(row, rowIndex) {
                    var decisionsRow = generateDecisionsRow(vm.decisions, row.id, row.valueType);
                    var rowBlock = [
                        '<div class="m-group-row-static js-matrix-item-content visual-type-' + row.valueType.toLowerCase() + '" id="m-characteristics-group-' + container.id + '-' + row.id + '">',
                            decisionsRow,
                        '</div>'
                    ].join('\n');
                    rows.push(rowBlock);
                });

                // Content block
                var content = [
                    '<div class="m-group" id="g-characteristics-content-' + container.id + '" data-characteristic-group="' + container.id + '">',
                    // '<div class="m-group" id="g-characteristics-content-' + container.id + '" style="height: ' + container.characteristics.length * 50 +'px">',
                        rows.join('\n'),
                    '</div>'
                ].join('\n');

                // Group block
                // console.log(container);
                var containerHtml = [
                    '<div class="m-group" id="g-characteristics-' + container.id + '">',
                        '<div class="m-group-title">',
                            // container.name,
                        '</div>',
                        content,
                    '</div>'
                ].join('\n');

                html.push(containerHtml);
                // console.log(html);
            });
            render(html.join('\n'));
        }

        var emptyCol = [
            '<div class="characteristics-content"></div>',
            '<div class="app-item-additional-wrapper">',
                '<a class="app-item-comments link-secondary" href="#">',
                    '<span class="glyphicon glyphicon-comment"></span>0',
                '</a>',
            '</div>'
        ].join('\n');

        function generateCharacteristicsMatrix(decisions) {
            // console.log(decisions);
            // Empty criterion?!
            $($element).find('.m-group-col-static').html(emptyCol);
            _.forEach(decisions, function(decision, decisionIndex) {
                _.forEach(decision.characteristics, function(characteristics) {
                    var id = '#m-characteristics-' + decisionIndex + '-' + characteristics.id;
                    var el = $(id);
                    // var content = '';
                    var content = ContentFormaterService.getTemplate(characteristics.value, el.data('value-type'));
                    el.find('.characteristics-content').html(content);
                    // console.log(id, content);
                });
            });

            $compile($element.contents())($scope);
        }        

        function render(html) {
            $element.html(html);
            $compile($element.contents())($scope);
        }
    }

})();