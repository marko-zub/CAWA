(function() {

    'user strict';

    angular
        .module('app.decision')
        .controller('DecisionController', DecisionController);

    DecisionController.$inject = ['$rootScope', 'decisionBasicInfo', 'DecisionDataService', '$stateParams', '$timeout', 'DecisionNotificationService', 'DecisionSharedService'];

    function DecisionController($rootScope, decisionBasicInfo, DecisionDataService, $stateParams, $timeout, DecisionNotificationService, DecisionSharedService) {
        var
            vm = this,
            isInitedSorters = false,
            defaultDecisionCount = 10;

        console.log('Decision controller');

        vm.decisionId = $stateParams.id;
        vm.decisionsList = [];
        vm.updateDecisionList = [];
        vm.decision = decisionBasicInfo || {};
        $rootScope.pageTitle = vm.decision.name + ' | DecisionWanted';

        $rootScope.breadcrumbs = [{
            title: 'Decisions',
            link: 'decisions'
        }, {
            title: vm.decision.name,
            link: null
        }];

        init();

        function asyncLoading(result) {
            //Acync rendering
            // $timeout(function() {
                vm.decisionsList = vm.decisionsList.concat(result.splice(0, defaultDecisionCount));
                if (result.length > 0) {
                    asyncLoading(result);
                }
            // }, 0);
        }

        function prepareDataToDisplay(characteristics) {
            var modifiedCharacteristics = {};
            _.forEach(characteristics, function(item) {
                if (!modifiedCharacteristics[item.characteristicGroupId]) {
                    modifiedCharacteristics[item.characteristicGroupId] = [];
                }
                modifiedCharacteristics[item.characteristicGroupId].push(item);
            });
            return modifiedCharacteristics;
        }

        function searchDecisions() {
            return DecisionDataService.searchDecision(vm.decisionId, DecisionSharedService.getFilterObject()).then(function(result) {
                vm.decisionsList.length = 0;
                setDecisionMatchPercent(result.decisions);
                asyncLoading(result.decisions);
                initSorters();
                DecisionSharedService.filterObject.pagination.totalDecisions = result.totalDecisions;
            }).finally(function() {
                vm.decisionsSpinner = false;
            });
        }

        //Set decions percent(% criterion match)
        function setDecisionMatchPercent(list) {
            var percent;
            _.forEach(list, function(initItem) {
                percent = parseFloat(initItem.criteriaCompliancePercentage);
                if (_.isNaN(percent)) {
                    percent = 0;
                } else if (!_.isInteger(percent)) {
                    percent = percent.toFixed(2);
                }
                initItem.criteriaCompliancePercentage = percent + '%';
            });
        }

        //Init sorters, when directives loaded
        function initSorters() {
            if (!isInitedSorters) {
                DecisionNotificationService.notifyInitSorter({
                    list: [{ name: 'Weight', order: 'DESC', isSelected: true }],
                    type: 'sortByCriteria',
                    mode: 'twoStep'
                });
                DecisionNotificationService.notifyInitSorter({
                    list: [
                        { name: 'Create Date', propertyId: 'createDate' },
                        { name: 'Update Date', propertyId: 'updateDate' },
                        { name: 'Name', propertyId: 'name' }
                    ],
                    type: 'sortByDecisionProperty',
                    mode: 'threeStep'
                });
                isInitedSorters = true;
            }
        }

        function init() {
            //Check if main decision
            if (!_.isEmpty(vm.decision.parentDecisionIds)) {
                vm.parentDecisions = vm.decision.parentDecisionIds;
            }

            //Get data for decision panel (main)
            vm.decisionsSpinner = true;
            searchDecisions();

            //Subscribe to notification events
            DecisionNotificationService.subscribeSelectCriterion(function(event, data) {
                setDecisionMatchPercent(data);
                vm.decisionsList = data;
            });
            DecisionNotificationService.subscribePageChanged(function() {
                vm.decisionsSpinner = true;
                searchDecisions();
            });
            DecisionNotificationService.subscribeGetDetailedCharacteristics(function(event, data) {
                data.detailsSpinner = true;
                DecisionDataService.getDecisionCharacteristics(vm.decisionId, data.decisionId).then(function(result) {
                    data.characteristics = prepareDataToDisplay(result);
                }).finally(function() {
                    data.detailsSpinner = false;
                });
            });
            DecisionNotificationService.subscribeSelectSorter(function(event, data) {
                vm.decisionsSpinner = true;
                DecisionSharedService.filterObject.sorters[data.mode] = data.sort;
                searchDecisions();
            });

            // Not implemented yet
            DecisionNotificationService.subscribeSelectCharacteristic(function(event, data) {
                console.log(data);
            });
        }
    }
})();