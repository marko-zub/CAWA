(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('DeicisionReviewsController', DeicisionReviewsController);

    DeicisionReviewsController.$inject = [];

    function DeicisionReviewsController() {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            console.log('Deicision Reviews Controller');
        }

    }
})();