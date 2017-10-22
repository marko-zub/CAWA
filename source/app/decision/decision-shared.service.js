(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('DecisionSharedService', DecisionSharedService);

    DecisionSharedService.$inject = [];

    function DecisionSharedService() {
        var service = this;

        var emptyFilterObject = {
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
            persistent: false, //as we disable analysis true
            includeChildDecisionIds: null,
            excludeChildDecisionIds: null,
            filterQueries: null,
            decisionNameFilterPattern: null
        };

        service.filterObject = angular.copy(emptyFilterObject);

        //allias
        service.getFilterObject = function() {
            return service.filterObject;
        };
        // TODO: add function to clear object
        // Remove send 'data' etc...
        service.getRequestFilterObject = function() {
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
                persistent: false, //_fo.persistent,
                includeChildDecisionIds: _fo.includeChildDecisionIds,
                excludeChildDecisionIds: _fo.excludeChildDecisionIds,
                filterQueries: _fo.filterQueries,
                decisionNameFilterPattern: _fo.decisionNameFilterPattern
            };
        };

        service.changeFilterObject = function(obj) {
            if(_.isEmpty(obj)) return;
            // TODO: add check obj properties or clear function
            service.filterObject = obj;
        };

        // Set data from request
        service.setFilterObject = function(obj) {
            if (!obj) return;

            // Fix for inclusion tab first time call
            if ((obj.excludeChildDecisionIds && obj.excludeChildDecisionIds.length) > 0 && !obj.includeChildDecisionIds) {
                obj.includeChildDecisionIds = null;
            } else if (obj.includeChildDecisionIds && obj.includeChildDecisionIds.length) {
                obj.excludeChildDecisionIds = obj.includeChildDecisionIds;
                obj.includeChildDecisionIds = null;
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
                    totalDecisions: obj.totalDecisions || (obj.pageNumber + 1) * obj.pageSize //Need to be sended in analysis or in endpoint api/v1.0/decisions/16003
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
                persistent: false, //obj.persistent || false,
                filterQueries: obj.filterQueries || null,
                decisionNameFilterPattern: obj.decisionNameFilterPattern || null
            };

            service.filterObject = sortObjAnalysis;
        };

        service.setCleanFilterObject = function() {
            service.filterObject = angular.copy(emptyFilterObject);
            return service.filterObject;
        };


    }
})();