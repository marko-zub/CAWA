(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('DecisionSharedService', DecisionSharedService);

    DecisionSharedService.$inject = ['$rootScope'];

    function DecisionSharedService($rootScope) {
        var service = this;

        service.filterObject = {
            selectedCriteria: {
                sortCriteriaIds: [],
                sortCriteriaCoefficients: {}
            },
            pagination: {
                pageNumber: 1,
                pageSize: 10,
                totalDecisions: 0
            },
            selectedCharacteristics: {},
            sorters: {
                sortByCriteria: {
                    order: 'DESC'
                },
                sortByCharacteristic: {
                    id: null,
                    order: null
                },
                sortByDecisionProperty: {
                    id: null,
                    order: null
                }
            },
            selectedDecision: {
                decisionsIds: []
            },
            persistent: true,
            includeChildDecisionIds: null,
            excludeChildDecisionIds: null
        };

        //allias

        service.getFilterObject = function() {
            var _fo = service.filterObject;
            // console.log(_fo);
            // console.log(_fo.pagination.pageNumber);
            return {
                //selected criteria
                sortCriteriaIds: _fo.selectedCriteria.sortCriteriaIds,
                //selected criteria coefficients
                sortCriteriaCoefficients: _fo.selectedCriteria.sortCriteriaCoefficients,
                //pagination
                pageNumber: _fo.pagination.pageNumber - 1,
                pageSize: _fo.pagination.pageSize,
                //sorting by:
                //criteria weight (1st level)
                sortWeightCriteriaDirection: _fo.sorters.sortByCriteria.order,
                //characteristic (2nd level)
                sortCharacteristicId: _fo.sorters.sortByCharacteristic.id,
                sortCharacteristicDirection: _fo.sorters.sortByCharacteristic.order,
                //property (3rd level)
                sortDecisionPropertyName: _fo.sorters.sortByDecisionProperty.id,
                sortDecisionPropertyDirection: _fo.sorters.sortByDecisionProperty.order,

                decisionsIds: _fo.selectedDecision.decisionsIds,
                persistent: _fo.persistent,
                includeChildDecisionIds: !_.isEmpty(_fo.includeChildDecisionIds) ? _fo.includeChildDecisionIds : null,
                excludeChildDecisionIds: !_.isEmpty(_fo.excludeChildDecisionIds) ? _fo.excludeChildDecisionIds : null
            };
        };

        service.setFilterObject = function(obj) {
            if (!obj) return;

            // Set new values
            var sortObjAnalysis = {
                selectedCriteria: {
                    sortCriteriaIds: obj.sortCriteriaIds || [],
                    sortCriteriaCoefficients: obj.sortCriteriaCoefficients || {}
                },
                pagination: {
                    pageNumber: obj.pageNumber ? obj.pageNumber + 1 : 1,
                    pageSize: obj.pageSize || 10,
                    totalDecisions: obj.totalDecisions || (obj.pageNumber + 1)*obj.pageSize //Need to be sended in analysis or in endpoint api/v1.0/decisions/16003
                },
                selectedCharacteristics: {},
                sorters: {
                    sortByCriteria: {
                        order: obj.sortWeightCriteriaDirection || 'DESC'
                    },
                    sortByCharacteristic: {
                        id: obj.sortCharacteristicId || null,
                        order: obj.sortCharacteristicDirection || null
                    },
                    sortByDecisionProperty: {
                        id: obj.sortDecisionPropertyName || null,
                        order: obj.sortDecisionPropertyDirection || null
                    }
                },
                selectedDecision: {
                    decisionsIds: []
                },
                includeChildDecisionIds: obj.includeChildDecisionIds || null,
                excludeChildDecisionIds: obj.excludeChildDecisionIds || null,
                persistent: obj.persistent === false ? obj.persistent : true
            };

            service.filterObject = sortObjAnalysis;
        };


    }
})();