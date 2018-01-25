(function() {

    'use strict';

    angular
        .module('app.components')
        .constant('TranslateConstant', {
            LANGS: [{
                name: 'ENG',
                key: 'en',
                selected: false
            }, {
                name: 'UA',
                key: 'uk',
                selected: false
            }, {
                name: 'RUS',
                key: 'ru',
                selected: false
            }],
            LANG_KEYS: ['en', 'uk', 'ru']
        });
})();