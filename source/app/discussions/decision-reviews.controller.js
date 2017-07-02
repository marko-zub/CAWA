(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('DeicisionReviewsController', DeicisionReviewsController);

    DeicisionReviewsController.$inject = ['$rootScope', '$stateParams'];

    function DeicisionReviewsController($rootScope, $stateParams) {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            console.log('Deicision Reviews Controller');
        }

    }
})();