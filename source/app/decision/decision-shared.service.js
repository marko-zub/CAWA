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
            includeChildids: null,
            excludeChildids: null,
            filterQueries: null
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
                sortid: _fo.sorters.sortByCharacteristic.id,
                sortCharacteristicDirection: _fo.sorters.sortByCharacteristic.order,
                //property (3rd level)
                sortDecisionPropertyName: _fo.sorters.sortByDecisionProperty.id,
                sortDecisionPropertyDirection: _fo.sorters.sortByDecisionProperty.order,

                decisionsIds: _fo.selectedDecision.decisionsIds,
                persistent: _fo.persistent,
                includeChildids: _fo.includeChildids,
                excludeChildids: _fo.excludeChildids,
                filterQueries: _fo.filterQueries
            };
        };

        service.setFilterObject = function(obj) {
            if (!obj) return;

            // Fix for inclusion tab first time call
            if((obj.excludeChildids && obj.excludeChildids.length) > 0 && !obj.includeChildids) {
                obj.includeChildids = null;
            } else if (obj.includeChildids && obj.includeChildids.length) {
                obj.excludeChildids = obj.includeChildids;
                obj.includeChildids = null;
            }

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
                        id: obj.sortid || null,
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
                includeChildids: obj.includeChildids || null,
                excludeChildids: obj.excludeChildids || null,
                persistent: obj.persistent || false,
                filterQueries: obj.filterQueries || null
            };

            service.filterObject = sortObjAnalysis;
        };


    }
})();