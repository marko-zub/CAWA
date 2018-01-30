(function() {

    'use strict';

    angular.module('app.decision')
        .controller('DecisionMatrixController', DecisionMatrixController);

    DecisionMatrixController.$inject = ['decisionBasicInfo', '$rootScope', 'Config', '$stateParams', 'translateFilter', '$state'];

    function DecisionMatrixController(decisionBasicInfo, $rootScope, Config, $stateParams, translateFilter, $state) {
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

                if (vm.decision.decisionGroups[index] && index >= 0) {

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
                    $rootScope.ogImage = vm.decision.imageUrl;
                    $rootScope.pageTitle = vm.decision.name  + ' ' + vm.decision.decisionGroups[index].name + ' ' + translateFilter('Comparison Matrix') + ' | DecisionWanted.com';
                } else {
                    $state.go('404');
                }
            }
        }
    }
})();