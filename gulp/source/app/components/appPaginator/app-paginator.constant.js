(function() {

    'use strict';

    angular
        .module('app.components')
        .constant('PaginatorConstant', {
            ITEMS_PER_PAGE: [5, 10, 20, 50, 100],
            ITEMS_PER_PAGE_SM: [5, 10],
            TOTAL: 10
        });
})();