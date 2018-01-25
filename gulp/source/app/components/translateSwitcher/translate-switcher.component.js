(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('TranslateSwitcherController', TranslateSwitcherController)
        .component('translateSwitcher', {
            templateUrl: 'app/components/translateSwitcher/translate-switcher.html',
            controller: 'TranslateSwitcherController',
            controllerAs: 'vm'
        });

    TranslateSwitcherController.$inject = ['$translate', '$localStorage', 'TranslateConstant', '$rootScope'];

    function TranslateSwitcherController($translate, $localStorage, TranslateConstant, $rootScope) {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            vm.langs = TranslateConstant.LANGS;
            vm.isopen = false;

            var langSelectedIndex = 0;
            if ($rootScope.translateCode) {
                langSelectedIndex = _.findIndex(vm.langs, function (find) {
                    return find.key === $rootScope.translateCode;
                });
            }

            changeLanguage(langSelectedIndex);
        }

        vm.changeLanguage = changeLanguage;

        function changeLanguage (index) {
        	var prevIndex = _.findIndex(vm.langs, function (item) {
        		return item.selected === true;
        	});
            if (prevIndex >= 0) {
                vm.langs[prevIndex].selected = false;
            }
            if (prevIndex === index) {
                return;
            }

        	vm.langSelected = vm.langs[index];
        	vm.langs[index].selected = true;
        	$translate.use(vm.langSelected.key).then(function() {
                $localStorage.translateCode = vm.langSelected.key;
            });
        }

    }

})();