(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionCategoriesController', DecisionCategoriesController);

    DecisionCategoriesController.$inject = ['$rootScope', 'decisionBasicInfo', '$state', '$stateParams', 'Config', 'DecisionsUtils'];

    function DecisionCategoriesController($rootScope, decisionBasicInfo, $state, $stateParams, Config, DecisionsUtils) {

        // TODO: clean up controller
        var vm = this;

        var decision = DecisionsUtils.prepareDecisionSingleToUI(decisionBasicInfo, true, false) || {};
        vm.decision = DecisionsUtils.prepareDecisionLogoToUI(decision);
        vm.$onInit = onInit;
        var pageTitle;

        function onInit() {
            if (!vm.decision.decisionGroups) {
                setPageData();
            }
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
            $rootScope.ogImage = vm.decision.metaOgImage;
            $rootScope.oggDescription = vm.decision.oggDescription ? vm.decision.oggDescription : '';

            if (tab) {
                pageTitle = vm.decision.name + ' ' + vm.decisionGroupActive.name;
                setPageTitle(false);
            } else if ($stateParams.categorySlug) {
                // TODO: check if we need this if
                pageTitle = vm.decision.name + ' ' + vm.decisionGroupActive.name;
                setPageTitle();
            } else {
                pageTitle = vm.decision.name + ' Categories';
                setPageTitle();
            }
        }

        var pageTitlePreffix = '';

        function setPageTitle(setPageNumber, pageNumber, tabName) {
            pageNumber = pageNumber || $stateParams.page;
            var pageTitleSuffix = '';
            if (setPageNumber !== false) {
                pageTitleSuffix = pageNumber > 1 ? ' - Page ' + pageNumber : '';
            }
            if (tabName) {
                pageTitlePreffix = tabName + ' ';
            }
            $rootScope.pageTitle = pageTitlePreffix + pageTitle + pageTitleSuffix + ' | ' + Config.pagePrefix;
        }

        vm.onChangeTab = onChangeTab;

        function onChangeTab(tab) {
            vm.decisionGroupActive = tab;
            setPageData(null, tab);
        }

        vm.onChangePage = onChangePage;

        function onChangePage(pagination) {
            if (pagination) {
                setPageTitle(true, pagination.pageNumber);
            }
        }

        vm.onChangeSortMode = onChangeSortMode;

        function onChangeSortMode(tab) {
            if (tab) {
                setPageTitle(true, null, tab.label);
            }
        }
    }
})();