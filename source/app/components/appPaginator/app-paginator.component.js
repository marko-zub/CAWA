(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('PaginatorController', PaginatorController)
        .component('appPaginator', {
            templateUrl: 'app/components/appPaginator/app-paginator.html',
            controller: 'PaginatorController',
            controllerAs: 'vm',
            bindings: {
                pageNumber: '<',
                pageSize: '<',
                perPage: '<',
                total: '<',
                onChangePage: '&'
            }
        });

    PaginatorController.$inject = ['PaginatorConstant'];

    function PaginatorController(PaginatorConstant) {
        var vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;
        vm.changePage = changePage;
        vm.changePageSize = changePageSize;
        vm.pagination = {};

        function onInit() {
            vm.itemsPerPage = vm.perPage || PaginatorConstant.ITEMS_PER_PAGE;
            vm.pagination = {
                pageNumber: vm.pageNumber,
                pageSize: vm.pageSize || PaginatorConstant.ITEMS_PER_PAGE[1],
                totalDecisions: vm.total || PaginatorConstant.TOTAL
            };
            vm.pageField = vm.pagination.pageNumber; //undefined;
            vm.paginationReady = true;
        }

        function onChanges(changes) {
            if (changes.itemsPerPage &&
                !angular.equals(changes.itemsPerPage.currentValue, changes.itemsPerPage.previousValue)) {
                vm.itemsPerPage = angular.copy(changes.itemsPerPage.currentValue);
            }
            if (changes.pageNumber &&
                !angular.equals(changes.pageNumber.currentValue, changes.pageNumber.previousValue)) {
                vm.pagination.pageNumber = angular.copy(changes.pageNumber.currentValue);
            }
            if (changes.pageSize &&
                !angular.equals(changes.pageSize.currentValue, changes.pageSize.previousValue)) {
                vm.pagination.pageSize = angular.copy(changes.pageSize.currentValue);
            }
            if (changes.total &&
                !angular.equals(changes.total.currentValue, changes.total.previousValue)) {
                vm.pagination.totalDecisions = angular.copy(changes.total.currentValue);
            }
        }

        function changePage() {
            vm.pageField = vm.pagination.pageNumber; //undefined;
            vm.onChangePage({
                pagination: vm.pagination
            });
        }

        function changePageSize() {
            vm.pagination.pageNumber = 1;
            vm.pageField = vm.pageNumber; //undefined;
            vm.onChangePage({
                pagination: vm.pagination
            });
        }

        function isVaildPageNumber(number) {
            var isValid = true;
            var totalPages = parseInt(vm.pagination.totalDecisions) / parseInt(vm.pagination.pageSize) + 1;
            if (number <= 0) {
                isValid = false;
                vm.pageField = 1;
            } else if (number > totalPages) {
                vm.pageField = parseInt(totalPages);
                isValid = false;
            } else if (!number) {
                isValid = false;
            }
            return isValid;
        }

        vm.goToPage = goToPage;

        function goToPage($event) {
            if ($event.keyCode === 13 && isVaildPageNumber($event.target.value)) {
                vm.pagination.pageNumber = parseInt(vm.pageField);
                changePage();
            }
        }
    }

})();