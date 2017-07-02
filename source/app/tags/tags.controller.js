(function() {

    'use strict';

    angular
        .module('app.tags')
        .controller('TagsController', TagsController);

    TagsController.$inject = [];

    function TagsController() {
        var
            vm = this;

        vm.$onInit = onInit;

        function onInit() {
            console.log('Tags controller');
        }
    }
})();