(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MatrixCharacteristicsController', MatrixCharacteristicsController)
        .component('matrixCharacteristics', {
            bindings: {
                list: '<'
            },
            controller: 'MatrixCharacteristicsController',
            controllerAs: 'vm'
        });




    MatrixCharacteristicsController.$inject = ['DiscussionsNotificationService', '$element', '$compile', '$scope', 'ContentFormaterService'];

    function MatrixCharacteristicsController(DiscussionsNotificationService, $element, $compile, $scope, ContentFormaterService) {
        var vm = this;

        // Discussions
        vm.getComments = getComments;

        // vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        var decisionsIdsPrev, decisionsIds;

        // function onInit() {
        //     if (vm.list) {
        //         vm.listDisplay = vm.list;
        //         // decisionsIds = pickDecisionsIds(vm.list);
        //         decisionsIdsPrev = angular.copy(decisionsIds);

        //         renderMatrix(vm.listDisplay);
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

                renderMatrix(vm.listDisplay);
            }
        }

        function pickDecisionsIds(list) {
            var copy = angular.copy(list[0].characteristics[0].decisionsRow);
            return _.map(copy, function(item) {
                return item.decision.decisionId;
            });
        }

        function renderMatrix(list) {

            var html =_.map(list, function(group) {

                var items = _.map(group.characteristics, function(characteristics) {

                    var decisions = _.map(characteristics.decisionsRow, function(decisionCol) {
                        // console.log(decisionCol);
                        return [
                            '<div class="matrix-col matrix-criteria-group" id="'+ group.characteristicGroupId + '-' +decisionCol.decision.decisionId+'" ng-click="vm.getComments($event)">',
                                '<div class="matrix-col-content">',
                                    ContentFormaterService.getTemplate(decisionCol.characteristics),
                                    '<div class="app-item-additional-wrapper">',
                                        '<div class="app-item-comments">',
                                            '<span class="glyphicon glyphicon-comment"></span>0',
                                        '</div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                        ].join('\n');
                    }).join('\n');

                    return [
                        '<div class="matrix-item matrix-item-content js-matrix-item-content">',
                            '<div class="matrix-row">',
                                decisions,
                            '</div>',
                        '</div>',
                    ].join('\n');
                }).join('\n');

                return [
                    '<div class="matrix-g matrix-g-characteristic" id="' + group.characteristicGroupId + '">',
                        '<div class="matrix-item matrix-g-item matrix-item-content">',
                        '</div>',
                        items,
                    '</div>'
                ].join('\n');
            }).join('\n');

            // console.log(html.join('\n'));
            // return html;
            renderHtml(html);
        }        

        function getComments($event) {
            // if(!$($event.target).hasClass('link-secondary')) {
            vm.isGetCommentsOpen = true;
            DiscussionsNotificationService.notifyOpenDiscussion('data');
            $event.preventDefault();
        }

        function renderHtml(html) {
            $element.html(html);
            $compile($element.contents())($scope);
        }        
    }

})();