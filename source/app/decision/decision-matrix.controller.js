(function() {

    'use strict';

    angular.module('app.decision')
        .controller('DecisionMatrixController', DecisionMatrixController);

    DecisionMatrixController.$inject = ['decisionBasicInfo', '$rootScope', 'Config', '$stateParams', 'translateFilter'];

    function DecisionMatrixController(decisionBasicInfo, $rootScope, Config, $stateParams, translateFilter) {
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
                    link: 'decisions({sort: null, size: null, page: null, sort: null, decisionId: null})'
                }, {
                    title: vm.decision.name,
                    link: 'decisions.single({sort: null, size: null, page: null, sort: null, decisionId: null})'
                }, {
                    title: 'Categories',
                    link: 'decisions.single.categories({categorySlug: null, sort: null, size: null, page: null, sort: null, decisionId: null})'
                }, {
                    title: vm.decision.decisionGroups[index].name,
                    link: 'decisions.single.categories({categorySlug: "' + vm.decision.decisionGroups[index].nameSlug + '"})'
                }, {
                    title: 'Comparison Matrix',
                    link: null
                }];
            }

            $rootScope.pageTitle = vm.decision.decisionGroups[index].name + ' ' + vm.decision.name + ' ' + translateFilter('Comparison Matrix') + ' | DecisionWanted.com';
        }
    }
})();