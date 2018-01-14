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

            decisionParents = $resource(decisionUrl + '/parents', {
                id: '@id'
            }, {
                getDecisionParentById: {
                    method: 'GET',
                    isArray: true,
                    cache: true
                }
            }),

            decisionsMatrix = $resource(Config.endpointUrl + 'decisiongroups/:id/decisions/matrix', {
                id: '@id'
            }, {
                getDecisionById: {
                    method: 'POST',
                    isArray: false
                }
            }),

            decisionGroups = $resource(Config.endpointUrl + 'decisiongroups/:id', {
                id: '@id'
            }, {
                getDecisionById: {
                    method: 'GET',
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

            decisionsAnalysis = $resource(Config.endpointUrl + 'analysis/:anlysisId', {
                anlysisId: '@anlysisId'
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
                fetchMedia: '@fetchMedia',
                fetchDecisionGroups: '@fetchDecisionGroups',
                fetchParentDecisionGroups: '@fetchParentDecisionGroups'
            }),

            decisionsInfo = $resource(decisionUrl, {
                id: '@id'
            }),

            decisionCharacteristics = $resource(decisionUrl + '/decisions/:childId/characteristics', {
                id: '@id',
                childId: '@childId'
            }, {}),

            criteriasGroups = $resource(Config.endpointUrl + 'decisiongroups/:id/criteriongroups'),

            characteristictsGroups = $resource(Config.endpointUrl + 'decisiongroups/:id/characteristicgroups', {
                options: '@options'
            }),

            criteriaByDecision = $resource(decisionUrl + '/:decisionId/decisions/:criterionId/criteria', {
                criterionId: '@criterionId',
                decisionId: '@decisionId'
            }, {}),

            criteriaByDecisionIndex = $resource(Config.endpointUrl + 'decisiongroups/:parentDecisionId/decisions/:decisionId/index', {
                decisionId: '@decisionId',
                parentDecisionId: '@parentDecisionId'
            }, {
                query: {
                    method: 'POST',
                    isArray: false
                }
            }),

            characteristicOptions = $resource(Config.endpointUrl + 'characteristics/:characteristicId/characteristicoptions', {
                characteristicId: '@characteristicId'
            }, {}),


            characteristicValueHistory = $resource(Config.endpointUrl + 'values/:id/history', {
                id: '@id',
                startDate: '@startDate',
                endDate: '@endDate',
            }, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            });


        var service = {
            getDecisionParents: getDecisionParents,
            getDecisions: getDecisions,
            getDecisionMatrix: getDecisionMatrix,
            getDecisionGroups: getDecisionGroups,
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
            getCriteriaByDecisionIndex: getCriteriaByDecisionIndex,
            getDecisionAnalysis: getDecisionAnalysis,
            getDecisionNomination: getDecisionNomination,
            searchDecisions: searchDecisions,
            searchSuggestedDecisions: searchSuggestedDecisions,
            getDecisionsCount: getDecisionsCount,
            getCharacteristicValueHistory: getCharacteristicValueHistory,
        };

        return service;

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

        function getDecisionGroups(id, data) {
            return decisionGroups.getDecisionById({
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
            };

            if (params.fetchOwnerUsers) {
                sendParams.fetchOwnerUsers = params.fetchOwnerUsers;
            }
            if (params.fetchMedia) {
                sendParams.fetchMedia = params.fetchMedia;
            }
            if (params.fetchDecisionGroups) {
                sendParams.fetchDecisionGroups = params.fetchDecisionGroups;
            }
            if (params.fetchParentDecisionGroups) {
                sendParams.fetchParentDecisionGroups = params.fetchParentDecisionGroups;
            }

            return decisionInfoFull.query(sendParams).$promise;
        }

        function getDecisionCharacteristics(id, childId) {
            return decisionCharacteristics.query({
                id: id,
                childId: childId
            }).$promise;
        }

        function getCharacteristicOptionsById(characteristicId) {
            return characteristicOptions.query({
                characteristicId: characteristicId
            }).$promise;
        }

        function getDecisionAnalysis(anlysisId) {
            return decisionsAnalysis.get({
                anlysisId: anlysisId
            }).$promise;
        }

        function getCriteriaByDecision(criterionId, decisionId) {
            return criteriaByDecision.query({
                criterionId: criterionId,
                decisionId: decisionId
            }).$promise;
        }

        function getCriteriaByDecisionIndex(decisionId, parentDecisionId, data) {
            return criteriaByDecisionIndex.query({
                decisionId: decisionId,
                parentDecisionId: parentDecisionId,
            }, data).$promise;
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

        function getCharacteristicValueHistory(id, params) {
            var sendParams = {
                id: id
            };

            if (params && params.startDate && params.startDate) {
                if (params.startDate === params.startDate) {
                    sendParams = _.assign(sendParams, params);
                }
            }
            return characteristicValueHistory.query(sendParams).$promise;
        }
    }
})();