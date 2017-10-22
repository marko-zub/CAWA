(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('AdditionalScriptController', AdditionalScriptController)
        .component('additionalScript', {
            // templateUrl: 'app/components/additionalScript/additional-script.html',
            bindings: {
                socialType: '<',
            },
            controller: 'AdditionalScriptController',
            controllerAs: 'vm'
        });

    AdditionalScriptController.$inject = [];

    function AdditionalScriptController() {
        var vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        function onInit () {
            $(window).on('load', function () {
                toggleSharesByType(vm.socialType);
            });
        }

        function onChanges(changes) {
            if (!angular.equals(changes.socialType.currentValue, changes.socialType.previousValue)) {
                toggleSharesByType(changes.socialType.currentValue);
            }
        }

        // TODO: Avoid Jquery
        // Addthis provide 2 shares widgets in one JS file
        function toggleSharesByType() {
            if (vm.socialType === 'floating') {
                toggleShares(true);
            } else {
                toggleShares(false);
            }
        }

        function toggleShares(enableFloating) {
            if (enableFloating === true) {
                $('.at-expanding-share-button').show();
                $('#at4-share').hide();
            } else {
                $('.at-expanding-share-button').hide();
                $('#at4-share').show();
            }
        }
    }
})();