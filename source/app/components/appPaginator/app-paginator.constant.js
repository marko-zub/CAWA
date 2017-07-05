(function() {

    'use strict';

    angular
        .module('app.components')
        .constant('PaginatorConstant', {
            ITEMS_PER_PAGE: [5, 10, 20, 50, 100],
            ITEMS_PER_PAGE_MATRIX: [5, 10]
        });
})();