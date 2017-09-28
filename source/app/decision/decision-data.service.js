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
                    isArray: true,
                    cache: true
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

            decisionsPropertyGroups = $resource(decisionUrl + '/propertygroups', {
                id: '@id'
            }, {
                getDecisionsPropertyGroups: {
                    method: 'GET',
                    isArray: true
                }
            }),

            decisionsProperties = $resource(decisionUrl + '/properties', {
                id: '@id'
            }, {
                getDecisionsProperties: {
                    method: 'GET',
                    isArray: true
                }
            }),

            decisionsCount = $resource(Config.endpointUrl + 'decisions/count', {}, {
                getCount: {
                    method: 'GET',
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

            decisionViews = $resource(Config.endpointUrl + 'decisions/:id/viewings', {
                id: '@id'
            }),

            decisionInfoFull = $resource(decisionUrl, {
                id: '@id',
                fetchOwnerUsers: '@fetchOwnerUsers',
                fetchParentDecisions: '@fetchParentDecisions',
                fetchFollowingDecisions: '@fetchFollowingDecisions',
                fetchMedia: '@fetchMedia'
            }),

            decisionsInfo = $resource(decisionUrl, {
                id: '@id'
            }),

            decisionCharacteristics = $resource(decisionUrl + '/decisions/:childId/characteristics', {
                id: '@id',
                childId: '@childId'
            }, {}),

            criteriasGroups = $resource(decisionUrl + '/criteriongroups'),

            characteristictsGroups = $resource(decisionUrl + '/characteristicgroups', {
                options: '@options'
            }),

            criteriaByDecision = $resource(decisionUrl + '/:decisionId/decisions/:criterionId/criteria', {
                criterionId: '@criterionId',
                decisionId: '@decisionId'
            }, {}),

            characteristicOptions = $resource(decisionUrl + '/characteristics/:optionId/characteristicoptions', {
                id: '@id',
                optionId: '@optionId'
            }, {});



        var service = {
            getDecision: getDecision,
            getDecisionParents: getDecisionParents,
            getDecisions: getDecisions,
            getDecisionMatrix: getDecisionMatrix,
            getDecisionsPropertyGroups: getDecisionsPropertyGroups,
            getDecisionsProperties: getDecisionsProperties,
            getCriteriaGroupsById: getCriteriaGroupsById,
            getCharacteristicsGroupsById: getCharacteristicsGroupsById,
            getCharacteristicOptionsById: getCharacteristicOptionsById,
            postDecisionViews: postDecisionViews,
            getDecisionInfoFull: getDecisionInfoFull,
            getDecisionsInfo: getDecisionsInfo,
            getDecisionCharacteristics: getDecisionCharacteristics,
            getCriteriaByDecision: getCriteriaByDecision,
            getDecisionAnalysis: getDecisionAnalysis,
            getDecisionNomination: getDecisionNomination,
            searchDecisions: searchDecisions,
            searchSuggestedDecisions: searchSuggestedDecisions,
            getDecisionsCount: getDecisionsCount
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

        function getDecisionsPropertyGroups(id) {
            return decisionsPropertyGroups.getDecisionsPropertyGroups({
                id: id
            }).$promise;
        }

        function getDecisionsProperties(id) {
            return decisionsProperties.getDecisionsProperties({
                id: id
            }).$promise;
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

        function postDecisionViews(id) {
            return decisionViews.save({
                id: id
            }).$promise;
        }

        function getDecisionsInfo(id) {
            return decisionsInfo.query({
                id: id,
            }).$promise;
        }

        function getDecisionInfoFull(id, params) {
            var sendParams = {
                id: id
            }

            if (params.fetchOwnerUsers) { sendParams.fetchOwnerUsers = params.fetchOwnerUsers; }
            if (params.fetchParentDecisions) { sendParams.fetchParentDecisions = params.fetchParentDecisions; }
            if (params.fetchFollowingDecisions) { sendParams.fetchFollowingDecisions = params.fetchFollowingDecisions; }
            if (params.fetchMedia) { sendParams.fetchMedia = params.fetchMedia; }

            return decisionInfoFull.query(sendParams).$promise;
        }

        function getDecisionCharacteristics(id, childId) {
            return decisionCharacteristics.query({
                id: id,
                childId: childId
            }).$promise;
        }

        function getCharacteristicOptionsById(id, optionId) {
            return characteristicOptions.query({
                id: id,
                optionId: optionId
            }).$promise;
        }

        function getDecisionAnalysis(id) {
            return decisionsAnalysis.get({
                id: id
            }).$promise;
        }

        function getCriteriaByDecision(criterionId, decisionId) {
            return criteriaByDecision.query({
                criterionId: criterionId,
                decisionId: decisionId
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

        function getDecisionsCount() {
            return decisionsCount.getCount().$promise;
        }
    }
})();