(function() {

    'use strict';

    angular.module('app.decision')
        .controller('DecisionMatrixController', DecisionMatrixController);

    DecisionMatrixController.$inject = ['decisionBasicInfo', '$rootScope', 'Config', '$stateParams'];

    function DecisionMatrixController(decisionBasicInfo, $rootScope, Config, $stateParams) {
        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            vm.decision = decisionBasicInfo || {};
            setPageData();
        }

        function setPageData() {
            if ($stateParams.categorySlug) {
                var index = _.findIndex(vm.decision.decisionGroups, function(decisionGroup) {
                    return decisionGroup.nameSlug === $stateParams.categorySlug;
                });
                $rootScope.pageTitle = vm.decision.name + ' Comparison Matrix | ' + Config.pagePrefix;
                $rootScope.breadcrumbs = [{
                    title: 'Decisions',
                    link: 'decisions'
                }, {
                    title: vm.decision.name,
                    link: 'decisions.single'
                }, {
                    title: 'Categories',
                    link: 'decisions.single.categories({categorySlug: null})'
                }, {
                    title: vm.decision.decisionGroups[index].name,
                    link: 'decisions.single.categories({categorySlug: "' + vm.decision.decisionGroups[index].nameSlug + '"})'
                }, {
                    title: 'Comparison Matrix',
                    link: null
                }];
            }
        }
    }
})();