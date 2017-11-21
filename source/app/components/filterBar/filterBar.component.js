(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterBarController', FilterBarController)
        .component('filterBar', {
            templateUrl: 'app/components/filterBar/filter-bar.html',
            controller: 'FilterBarController',
            controllerAs: 'vm',
            bindings: {
                onChangeFilter: '&'
            }
        });

    FilterBarController.$inject = [];

    function FilterBarController() {
        var vm = this;

        vm.$onInit = onInit;
        // vm.$onChanges = onChanges;

        function onInit() {}

        // function onChanges(changes) {}
        // TODO: make component
        // Filter
        vm.clearFilterName = clearFilterName;
        vm.filterNameSubmit = filterNameSubmit;
        vm.filterNameSubmitClick = filterNameSubmitClick;
        vm.controlOptions = {
            debounce: 50
        };

        function clearFilterName() {
            vm.filterName = null;
            filterNameSend(null);
        }

        function filterNameSubmit(event, value) {
            if (event.keyCode === 13) {
                filterNameSend(value);
                event.preventDefault();
            }
        }

        function filterNameSend(value) {
            vm.onChangeFilter({
                value: value
            });
        }

        function filterNameSubmitClick(value) {
            // if (!value) return;
            // TODO: first request if ng-touched
            filterNameSend(value);
        }
        // End Filter name
    }

})();