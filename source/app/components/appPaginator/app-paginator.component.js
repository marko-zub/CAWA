(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('PaginatorController', PaginatorController)
        .component('appPaginator', {
            templateUrl: 'app/components/appPaginator/app-paginator.html',
            controller: 'PaginatorController',
            controllerAs: 'vm'
            bindings: {
                pageNumber: '<',
                pageSize: '<',
                total: '<',
                onChangePage: '&',
                onChangeSize: '&'
            }
        });

    PaginatorController.$inject = ['DecisionSharedService', 'DecisionNotificationService', 'PaginatorConstant'];

    function PaginatorController(DecisionSharedService, DecisionNotificationService, PaginatorConstant) {
        var vm = this;

        vm.$onInit = onInit;
        vm.changePage = changePage;
        vm.changePageSize = changePageSize;

        function onInit() {
            vm.pagination = {
                pageNumber: vm.pageNumber,
                pageSize: vm.pageSize,
                totalDecisions: vm.total || PaginatorConstant.TOTAL
            }
            vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE_MATRIX;
        }

        function changePage() {
            vm.onChangePage(vm.pagination);
        }

        function changePageSize() {
            vm.pagination.pageNumber = 1;
            vm.onChangeSize(vm.pagination);
        }
    }

})();