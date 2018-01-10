(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionCategoriesController', DecisionCategoriesController);

    DecisionCategoriesController.$inject = ['$rootScope', 'decisionBasicInfo', '$stateParams', 'Config'];

    function DecisionCategoriesController($rootScope, decisionBasicInfo, $stateParams, Config) {

        // TODO: clean up controller
        var vm = this;

        vm.decision = decisionBasicInfo || {};
        vm.$onInit = onInit;

        function onInit() {
            setPageData();
        }

        function setPageData(categorySlug, tab) {
            var title = vm.decision.name;
            var breadcrumbs = [{
                title: 'Decisions',
                link: 'decisions'
            }, {
                title: vm.decision.name,
                link: 'decisions.single'
            }, ];

            categorySlug = categorySlug || $stateParams.categorySlug;
            if (categorySlug) {
                var data = [{
                    title: 'Categories',
                    link: 'decisions.single.categories({categorySlug: null, sort: null})'
                }];

                var index = _.findIndex(vm.decision.decisionGroups, function(decisionGroup) {
                    return decisionGroup.nameSlug === categorySlug;
                });
                if (index >= 0) {
                    data.push({
                        title: vm.decision.decisionGroups[index].name,
                        link: null
                    });

                    title = vm.decision.decisionGroups[index].name + ' ' + title;
                }

                breadcrumbs = _.concat(breadcrumbs, data);
            } else {
                breadcrumbs.push({
                    title: 'Categories',
                    link: null
                });
            }
            $rootScope.breadcrumbs = breadcrumbs;

            if ($stateParams.category || tab) {
                $rootScope.pageTitle = vm.decision.name + ' ' + vm.decisionGroupActive.name + ' Categories | ' + Config.pagePrefix;
            } else {
                $rootScope.pageTitle = vm.decision.name + ' Categories | ' + Config.pagePrefix;
            }
        }

        vm.onChangeTab = onChangeTab;

        function onChangeTab(tab) {
            vm.decisionGroupActive = tab;
            setPageData(null, tab);
        }
    }
})();