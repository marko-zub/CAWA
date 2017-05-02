(function() {

    'use strict';

    angular
        .module('app.decision')
        .controller('DecisionSingleController', DecisionSingleController);

    DecisionSingleController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', '$stateParams', 'DecisionSharedService', 'PaginatorConstant', '$state', '$sce'];

    function DecisionSingleController($rootScope, decisionBasicInfo, DecisionDataService, $stateParams, DecisionSharedService, PaginatorConstant, $state, $sce) {
        var
            vm = this,
            isInitedSorters = false,
            defaultDecisionCount = 10;

        vm.decisionId = $stateParams.id;
        vm.decisionsList = [];
        vm.updateDecisionList = [];
        vm.decision = decisionBasicInfo || {};

        vm.itemsPerPage = PaginatorConstant.ITEMS_PER_PAGE;
        vm.changePageSize = changePageSize;
        vm.changePage = changePage;

        $rootScope.pageTitle = vm.decision.name + ' | DecisionWanted';

        $rootScope.breadcrumbs = [{
            title: 'Decisions',
            link: 'decisions'
        }, {
            title: vm.decision.name,
            link: null
        }];

        init();

        function init() {
            console.log('Decision Single Controller');
            initPagination();
            getDecisionNomimations($stateParams.id);
            getDecisionParents($stateParams.id);
        }

        function getDecisionNomimations(id) {
            if (!id) return;

            var pagination = _.clone(vm.pagination);
            pagination.pageNumber = pagination.pageNumber - 1;

            DecisionDataService.getDecisionNomination(id, pagination).then(function(result) {
                vm.decisions = descriptionTrustHtml(result.decisions);
                vm.pagination.totalDecisions = result.totalDecisions;
                // console.log(result);
            });
        }

        function getDecisionParents(id) {
            DecisionDataService.getDecisionParents(id).then(function(result) {
                // console.log(result);
                vm.decisionParents = result;

                if (vm.decision.totalChildDecisions) {
                    var decisionCopy = angular.copy(vm.decision);
                    decisionCopy.isActive = true;
                    decisionCopy.name = 'Top ' + decisionCopy.name;
                    vm.decisionParents.unshift(decisionCopy);
                }
                getDecisionParentsCriteriaCharacteristicts(vm.decisionParents);
            });
        }

        // TODO: clean up
        function getDecisionParentsCriteriaCharacteristicts(list) {
                getCriteriaGroupsById(list[0].decisionId);
                getCharacteristictsGroupsById(list[0].decisionId);            
            // if(list.lenght > 15) return;
            // _.forEach(list, function(parent) {
            //     // console.log('get', parent.decisionId);
            //     getCriteriaGroupsById(parent.decisionId);
            //     getCharacteristictsGroupsById(parent.decisionId);
            // });
        }

        // TODO: move to utils
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                el.description = $sce.trustAsHtml(el.description);
                if (el.criteriaCompliancePercentage) el.criteriaCompliancePercentage = _.floor(el.criteriaCompliancePercentage, 2);
                return el;
            });
        }

        // Pagination
        function changePageSize() {
            vm.pagination.pageNumber = 1;
            getDecisionNomimations($stateParams.id);
            updateStateParams();
        }

        function changePage() {
            getDecisionNomimations($stateParams.id);
            updateStateParams();
        }

        function initPagination() {
            vm.pagination = {
                pageNumber: parseInt($stateParams.page) || 1,
                pageSize: parseInt($stateParams.size) || 10,
                totalDecisions: vm.decision.totalChildDecisions || 10
            };
            // updateStateParams();
        }

        function updateStateParams() {
            // $state.go($state.current.name, {
            //     id: vm.decision.decisionId,
            //     slug: vm.decision.nameSlug,
            //     page: vm.pagination.pageNumber.toString(),
            //     size: vm.pagination.pageSize.toString()
            // }, {
            //     notify: true,
            //     reload: true,
            //     location: 'replace'
            // });
        }


        // TODO: move to service
        function getCriteriaGroupsById(decisionId) {
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                vm.criteriaGroups = descriptionTrustHtml(result);
                _.forEach(result, function(resultEl) {
                    descriptionTrustHtml(resultEl.criteria);
                });
            });
        }

        function getCharacteristictsGroupsById(decisionId) {
            // characteristics
            return DecisionDataService.getCharacteristictsGroupsById(decisionId).then(function(result) {
                vm.characteristicGroups = _.map(result, function(resultEl) {
                    resultEl.description = $sce.trustAsHtml(resultEl.description);
                    _.forEach(resultEl.characteristics, function(characteristic) {
                        characteristic.description = $sce.trustAsHtml(characteristic.description);
                    });
                    return resultEl;
                });
            });
        }

    }
})();