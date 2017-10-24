(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('RatingStarController', RatingStarController)
        .component('ratingStar', {
            template: renderTemplate,
            bindings: {
                weight: '<',
                totalVotes: '<',
                percentage: '<'
            },
            controller: 'RatingStarController',
            controllerAs: 'vm'
        });

    renderTemplate.$inject = [];

    function renderTemplate() {
        return '<div ng-bind-html="::vm.html"></div>';
    }

    RatingStarController.$inject = ['$element', 'AppRatingStarConstant'];

    function RatingStarController($element, AppRatingStarConstant) {
        var
            vm = this,
            value;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        // TODO: optimize component, clean up
        function onInit() {
            var votes = '';

            // Percentage
            if (!_.isUndefined(vm.percentage)) {
                vm.percentage = vm.percentage.toString();
                var percentage = vm.percentage || '0%';
                if (vm.percentage.indexOf('%') === -1) {
                    percentage = vm.percentage + '%';
                }
                vm.rating = percentage;

            } else {
                // Use bindings weight and totalVotes
                if (vm.weight) value = vm.weight.toString();
                vm.weight = vm.weight ? _.floor(vm.weight, 2).toFixed(2) : null;
                vm.rating = value;

                if (!vm.totalVotes) {
                    vm.totalVotes = 0;
                    // TODO: add compile
                    votes = '<a class="js-rating-rate" href>Rate it</a>';
                } else {
                    votes = [
                        '<div class="app-rating-votes">',
                        '<span class="app-rating-votes-weight">' + vm.weight + '</span>',
                        vm.totalVotes > 0 ? '<span class="app-rating-votes-likes"><i class="app-icon glyphicon glyphicon-thumbs-up"></i>' + vm.totalVotes + '</span>': '',
                        '</div>'
                    ].join('\n');
                }
                // calc default rating widthout %
                if (value && value.indexOf('%') === -1) {
                    vm.rating = parseFloat(vm.weight) / AppRatingStarConstant.MAX_RATING * 100 + '%' || 0;
                    vm.weight = vm.weight || 0;
                }
            }
            vm.html = renderStars(vm.rating, votes);

        }

        function onChanges(changes) {
            if (changes.weight && (!angular.equals(changes.weight.currentValue, changes.weight.previousValue)) ||
                (changes.totalVotes && !angular.equals(changes.totalVotes.currentValue, changes.totalVotes.previousValue)) ||
                (changes.percentage && !angular.equals(changes.percentage.currentValue, changes.percentage.previousValue))) {
                handleChange();
            }
        }

        function handleChange() {
            onInit();
        }

        function renderStars(percentage, votes) {
            votes = votes || '';
            return [
                '<div class="dw-stars-wrapper">',
                '<div class="dw-stars">',
                '<span class="bar" style="width:' + percentage + '"></span>',
                '</div>',
                votes,
                '</div>',
            ].join('\n');
        }
    }
})();