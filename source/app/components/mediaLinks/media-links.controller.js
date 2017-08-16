(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MediaLinksController', MediaLinksController)
        .component('mediaLinks', {
            bindings: {
                list: '<'
            },
            templateUrl: 'app/components/mediaLinks/media-links.html',
            controller: 'MediaLinksController',
            controllerAs: 'vm'
        });


    MediaLinksController.$inject = ['$sce'];

    function MediaLinksController($sce) {
        var vm = this;
        vm.$onInit = onInit;

        function onInit() {
            // console.log(vm.list);
            vm.list = prepareMedia(vm.list);
        }

        function prepareMedia(list) {
            return _.filter(list, function(item) {
                if (item.type === 'LINK') return item;
            });
        }
    }

})();