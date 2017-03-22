(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('PaginatorController', PaginatorController)
        .component('appPaginator', {
            templateUrl: 'app/components/appPaginator/app-paginator.html',
            controller: 'PaginatorController',
            controllerAs: 'vm'
        });

    PaginatorController.$inject = ['DecisionSharedService', 'DecisionNotificationService', 'PaginatorConstant'];

    function PaginatorController(DecisionSharedService, DecisionNotificationService, PaginatorConstant) {
        var vm = this;

        vm.pagination = DecisionSharedService.filterObject.pagination;
        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;

        vm.changePage = changePage;
        vm.changePageSize = changePageSize;

        function changePage() {
            DecisionNotificationService.notifyPageChanged();
        }

        function changePageSize() {
            DecisionSharedService.filterObject.pagination.pageNumber = 1;
            DecisionNotificationService.notifyPageChanged();
        }
    }

})();
