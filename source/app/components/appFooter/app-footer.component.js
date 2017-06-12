(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FooterController', FooterController)
        .component('appFooter', {
            templateUrl: 'app/components/appFooter/app-footer.html',
            controller: 'FooterController',
            controllerAs: 'vm'
        });

        FooterController.$inject = ['$rootScope'];

        function FooterController($rootScope) {
            var vm = this;
            vm.url = $rootScope.pageUrl;
            // console.log($rootScope);

            // TOOD: move social sharing to component
            // doCheck create additional watcher
            vm.$doCheck = doCheck;

            function doCheck(changes) {
                vm.url = $rootScope.pageUrl;
                // console.log($rootScope.pageUrl);
            }
        }

})();
