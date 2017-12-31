(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('HistoryChartModalController', HistoryChartModalController);

    HistoryChartModalController.$inject = ['$uibModalInstance', 'DecisionDataService', 'title', 'decision', 'characteristics'];

    function HistoryChartModalController($uibModalInstance, DecisionDataService, title, decision, characteristics) {
        var vm = this;

        vm.apply = apply;
        vm.close = close;

        init();

        function apply() {
            $uibModalInstance.close();
        }

        function close() {
            $uibModalInstance.dismiss();
        }

        function init() {
            vm.title = title;
            vm.decision = decision;
            vm.characteristics = characteristics;
        }

    }
})();