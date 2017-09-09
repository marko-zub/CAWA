(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('TranslateSwitcher', TranslateSwitcher)
        .component('translateSwitcher', {
            templateUrl: 'app/components/translateSwitcher/translate-switcher.html',
            controller: 'TranslateSwitcher',
            controllerAs: 'vm'
        });

    TranslateSwitcher.$inject = ['$translate'];

    function TranslateSwitcher($translate) {
        var vm = this;

        vm.$onInit = onInit;

        var LANGS = [
        	{ name: 'ENG', key: 'en', selected: true},
        	{ name: 'UA', key: 'uk', selected: false},
        	{ name: 'RUS', key: 'ru', selected: false}
        ];

        function onInit() {
            vm.langs = LANGS;
            vm.isopen = false;
            vm.langSelected = vm.langs[0];
        }

        vm.changeLanguage = changeLanguage;

        function changeLanguage (index) {
        	var prevIndex = _.findIndex(vm.langs, function (item) {
        		return item.selected === true;
        	});
        	vm.langs[prevIndex].selected = false;

        	vm.langSelected = vm.langs[index];
        	vm.langs[index].selected = true;
        	$translate.use(vm.langSelected.key);
        }

    }

})();