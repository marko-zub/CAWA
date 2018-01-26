(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('AdditionalScriptController', AdditionalScriptController)
        .component('additionalScript', {
            bindings: {
                socialType: '<',
            },
            controller: 'AdditionalScriptController',
            controllerAs: 'vm'
        });

    AdditionalScriptController.$inject = [];

    function AdditionalScriptController() {
        var vm = this;

        vm.$postLink = postLink;
        vm.$onChanges = onChanges;
        var addThisUrl = '//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-593e99ada6e43adc';

        function postLink() {
            $.getScript(addThisUrl, function() {
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
                $('body').removeClass('addthis-floating').addClass('addthis-expanding');
            } else {
                $('body').addClass('addthis-floating').removeClass('addthis-expanding');
            }
        }
    }
})();