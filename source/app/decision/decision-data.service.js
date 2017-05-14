(function() {

    'use strict';

    angular
        .module('app.decision')
        .factory('DecisionDataService', DecisionDataService);

    DecisionDataService.$inject = ['$resource', 'Config'];

    function DecisionDataService($resource, Config) {
        // TODO: clean up
        var
            decisionUrl = Config.endpointUrl + 'decisions/:id',

            decisions = $resource(Config.endpointUrl + 'decisions', {}, {
                getDecisions: {
                    method: 'GET',
                    isArray: false
                },
            }),

            decision = $resource(decisionUrl + '/decisions/list', {
                id: '@id'
            }, {
                getDecisionById: {
                    method: 'POST',
                    isArray: false
                }
            }),

            decisionParents = $resource(decisionUrl + '/parents', {
                id: '@id'
            }, {
                getDecisionParentById: {
                    method: 'GET',
                    isArray: true
                }
            }),

            decisionsMatrix = $resource(decisionUrl + '/decisions/matrix', {
                id: '@id'
            }, {
                getDecisionById: {
                    method: 'POST',
                    isArray: false
                }
            }),

            decisionsAnalysis = $resource(Config.endpointUrl + 'decisions/analysis/:id', {
                id: '@id'
            }, {
                getDecisionAnalysis: {
                    method: 'POST',
                    isArray: false
                }
            }),

            decisionsNominations = $resource(Config.endpointUrl + 'decisions/:id/nominations/hall-of-fame/decisions', {
                id: '@id'
            }, {
                getDecisionNomination: {
                    method: 'POST',
                    isArray: false
                }
            }),

            decisionsSearch = $resource(Config.endpointUrl + 'search/decisions', {
                query: '@query',
                pageNumber: '@pageNumber',
                pageSize: '@pageSize'
            }, {
                search: {
                    method: 'GET',
                    isArray: false
                }
            }),

            decisionsSuggestions = $resource(Config.endpointUrl + 'search/decisions/suggestions', {
                query: '@query',
                pageNumber: '@pageNumber',
                pageSize: '@pageSize'
            }, {
                search: {
                    method: 'GET',
                    isArray: false
                }
            }),

            decisionInfo = $resource(decisionUrl),
            decisionCharacteristics = $resource(decisionUrl + '/decisions/:childId/characteristics', {
                id: '@id',
                childId: '@childId'
            }, {}),
            criteriasGroups = $resource(decisionUrl + '/criteriongroups'),
            characteristictsGroups = $resource(decisionUrl + '/characteristicgroups', {
                options: '@options'
            }),
            criteriaByDecision = $resource(decisionUrl + '/:id/decisions/:criterionId/criteria', {
                criterionId: '@criterionId',
                id: '@id'
            }, {});


        var service = {
            getDecision: getDecision,
            getDecisionParents: getDecisionParents,
            getDecisions: getDecisions,
            getDecisionMatrix: getDecisionMatrix,
            getCriteriaGroupsById: getCriteriaGroupsById,
            getCharacteristicsGroupsById: getCharacteristicsGroupsById,
            getDecisionInfo: getDecisionInfo,
            getDecisionCharacteristics: getDecisionCharacteristics,
            getCriteriaByDecision: getCriteriaByDecision,
            getDecisionAnalysis: getDecisionAnalysis,
            getDecisionNomination: getDecisionNomination,
            searchDecisions: searchDecisions,
            searchSuggestedDecisions: searchSuggestedDecisions
        };

        return service;

        function getDecision(id, data) {
            return decision.getDecisionById({
                id: id
            }, data).$promise;
        }

        function getDecisionParents(id) {
            return decisionParents.getDecisionParentById({
                id: id
            }).$promise;
        }

        function getDecisions(data) {
            return decisions.getDecisions(data).$promise;
        }

        function getDecisionMatrix(id, data) {
            return decisionsMatrix.getDecisionById({
                id: id
            }, data).$promise;
        }

        function getCriteriaGroupsById(id) {
            return criteriasGroups.query({
                id: id
            }).$promise;
        }

        function getCharacteristicsGroupsById(id, data) {
            return characteristictsGroups.query({
                id: id
            }, data).$promise;
        }

        function getDecisionInfo(id) {
            return decisionInfo.get({
                id: id
            }).$promise;
        }

        function getDecisionCharacteristics(id, childId) {
            return decisionCharacteristics.query({
                id: id,
                childId: childId
            }).$promise;
        }

        function getDecisionAnalysis(id) {
            return decisionsAnalysis.get({
                id: id
            }).$promise;
        }

        function getCriteriaByDecision(criterionId, id) {
            return criteriaByDecision.query({
                criterionId: criterionId,
                id: id
            }).$promise;
        }

        function getDecisionNomination(id, data) {
            return decisionsNominations.getDecisionNomination({
                id: id
            }, data).$promise;
        }

        function searchDecisions(data) {
            return decisionsSearch.search({}, data).$promise;
        }

        function searchSuggestedDecisions(data) {
            return decisionsSuggestions.search({}, data).$promise;
        }
    }
})();