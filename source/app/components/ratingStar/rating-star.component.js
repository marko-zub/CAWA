(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('RatingStarController', RatingStarController)
        .component('ratingStar', {
            template: renderTemplate,
            bindings: {
                item: '<',
            },
            controller: 'RatingStarController',
            controllerAs: 'vm'
        });

    renderTemplate.$inject = [];

    function renderTemplate() {
        return '<div ng-bind-html="::vm.html"></div>';
    }

    RatingStarController.$inject = ['$element', 'AppRatingStarConstant', '$scope', '$compile'];

    function RatingStarController($element, AppRatingStarConstant, $scope, $compile) {
        var
            vm = this,
            value;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            var votes = '';
            if(!vm.item) return;
            if (vm.item.weight) value = vm.item.weight.toString();
            vm.item.weight = vm.item.weight ? Number((vm.item.weight).toFixed(1)) : null;
            vm.rating = value;

            if (!vm.item.totalVotes) {
                vm.item.totalVotes = 0;
                votes = '<a class="js-rating-rate" href>Rate it first</a>';
            } else {
                votes = [
                    '<div class="app-rating-votes">',
                        '<span class="app-rating-votes-weight">' + vm.item.weight + '</span>',
                        '<span><i class="app-icon glyphicon glyphicon-thumbs-up"></i>' + vm.item.totalVotes + '</span>',
                    '</div>'
                ].join('\n');
            }
            // calc default rating widthout %
            if (value && value.indexOf('%') === -1) {
                vm.rating = parseFloat(vm.item.weight) / AppRatingStarConstant.MAX_RATING * 100 + '%' || 0;
                vm.item.weight = vm.item.weight || 0;
            }

            var html = [
                '<div class="app-rating-star-wrapper">',
                    '<div class="app-rating-star">',
                        '<span class="bar" style="width:' + vm.rating + '"></span>',
                    '</div>',
                    votes,
                '</div>',
            ].join('\n');

            vm.html = html;
            // $element.html(html);
            // $compile($element.contents())($scope);
        }

        function onChanges(changes) {
            if (changes.item.currentValue &&
                !angular.equals(changes.item.currentValue, changes.item.previousValue)) {
                handleChange();
            }
        }

        function handleChange() {
            onInit();
        }
    }
})();