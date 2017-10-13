(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('PaginatioService', PaginatioService);

    PaginatioService.$inject = ['PaginatorConstant'];

    function PaginatioService(PaginatorConstant) {
        var service = this;
        // Private

        // Public
        service.initPagination = function(total, pageNumber, pageSize) {
            return {
                pageNumber: parseInt(pageNumber) || 1,
                pageSize: parseInt(pageSize) || PaginatorConstant.TOTAL,
                totalDecisions: parseInt(total) || PaginatorConstant.TOTAL
            };
        };

        service.itemsPerPage = function() {
            return PaginatorConstant.ITEMS_PER_PAGE;
        };

        service.itemsPerPageSm = function() {
            return PaginatorConstant.ITEMS_PER_PAGE_SM;
        };

    }
})();