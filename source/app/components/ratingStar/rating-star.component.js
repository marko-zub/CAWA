(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('RatingStarController', RatingStarController)
        .component('ratingStar', {
            templateUrl: 'app/components/ratingStar/rating-star.html',
            bindings: {
                value: '<',
                totalVotes: '<'
            },
            controller: 'RatingStarController',
            controllerAs: 'vm'
        });

    RatingStarController.$inject = ['$element', 'AppRatingStarConstant'];

    function RatingStarController($element, AppRatingStarConstant) {
        var
            vm = this,
            value;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit() {
            if (vm.value) value = vm.value.toString();
            vm.value = vm.value ? Number((vm.value).toFixed(1)) : null;
            vm.rating = value;
            if (!vm.totalVotes) {
                vm.totalVotes = 0;
                $($element).find('.js-rating-rate').addClass('hide');
                $($element).find('.js-total-votes').addClass('hide');
            } else {
                $($element).find('.js-total-votes').removeClass('hide');
            }
            // calc default rating widthout %
            if (value && value.indexOf('%') === -1) {
                vm.rating = parseFloat(vm.value) / AppRatingStarConstant.MAX_RATING * 100 + '%' || 0;
                vm.value = vm.value || 0;
            }
        }

        function onChanges() {
            onInit();
        }
    }
})();