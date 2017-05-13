(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('RatingStarController', RatingStarController)
        .component('ratingStar', {
            template: renderTemplate,
            bindings: {
                weight: '<',
                totalVotes: '<'
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
        // vm.$onChanges = onChanges;

        function onInit() {
            var votes = '';
            // if(!vm) return;
            if (vm.weight) value = vm.weight.toString();
            vm.weight = vm.weight ? Number(vm.weight).toFixed(1) : null;
            vm.rating = value;

            if (!vm.totalVotes) {
                vm.totalVotes = 0;
                votes = '<a class="js-rating-rate" href>Rate it first</a>';
            } else {
                votes = [
                    '<div class="app-rating-votes">',
                        '<span class="app-rating-votes-weight">' + vm.weight + '</span>',
                        '<span><i class="app-icon glyphicon glyphicon-thumbs-up"></i>' + vm.totalVotes + '</span>',
                    '</div>'
                ].join('\n');
            }
            // calc default rating widthout %
            if (value && value.indexOf('%') === -1) {
                vm.rating = parseFloat(vm.weight) / AppRatingStarConstant.MAX_RATING * 100 + '%' || 0;
                vm.weight = vm.weight || 0;
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
            if (!angular.equals(changes.weight.currentValue, changes.weight.previousValue) ||
                !angular.equals(changes.totalVotes.currentValue, changes.totalVotes.previousValue)) {
                handleChange();
            }
        }

        function handleChange() {
            onInit();
        }
    }
})();