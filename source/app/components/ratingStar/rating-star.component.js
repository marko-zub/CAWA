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

    RatingStarController.$inject = ['AppRatingStarConstant'];

    function RatingStarController(AppRatingStarConstant) {
        var
            vm = this,
            value;

        vm.$onChanges = onChanges;

        function onChanges() {
            if (vm.value) value = vm.value.toString();
            vm.rating = value;
            if (!vm.totalVotes) vm.totalVotes = 0;
            // calc default rating widthout %
            if (value && value.indexOf('%') === -1) {
                vm.rating = parseFloat(vm.value) / AppRatingStarConstant.MAX_RATING * 100 + '%' || 0;
                vm.value = vm.value || 0;
            }
        }

        init();

        function init() {

        }
    }
})();
