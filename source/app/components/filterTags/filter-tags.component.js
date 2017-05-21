(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterTagsController', FilterTagsController)
        .component('filterTags', {
            bindings: {
                characteristics: '<',
                criteria: '<'
            },
            template: renderTemplate,
            controller: 'FilterTagsController',
            controllerAs: 'vm'
        });

    renderTemplate.$inject = [];

    function renderTemplate() {
        return [
            '<div id="filter-tags" class="filter-tags" ng-show="vm.tags.length > 0 || vm.criteriaTags.length > 0">',
                '<div class="filter-tags-group" ng-show="vm.tags.length > 0">',
                    '<div class="filter-tags-label">Filtered by: </div>',
                    '<div class="tag-group" ng-repeat="tag in vm.tags track by tag.characteristicId">',
                        '<span>{{::tag.name}}:</span>',
                        '<div class="tag-wrapper" ng-repeat="tagVal in tag.data track by $index">',
                            '<div class="tag">',
                            '{{tagVal}}<span ng-click="vm.removeTag(tag, tagVal)" class="icon-remove"><i class="fa fa-times" aria-hidden="true"></i></span>',
                        '</div><span ng-if="tag.data.length > 1 && !$last" ng-bind="tag.operator" class="tag-divider"></span>',
                        '</div>',
                    '</div>',
                '</div>',

                '<div class="filter-tags-group" ng-show="vm.criteriaTags.length > 0">',
                    '<div class="filter-tags-label">Sorted by: </div>',
                    '<div class="tag-group">',
                        '<div class="tag-wrapper" ng-repeat="tag in vm.criteriaTags track by tag.id">',
                            '<div class="tag">',
                                '{{::tag.name}}<span ng-click="vm.removeCriteriaTag(tag)" class="icon-remove  hide"><i class="fa fa-times" aria-hidden="true"></i></span>',
                            '</div><span ng-if="!$last" class="tag-divider">and</span>',
                        '</div>',
                    '</div>',
                '</div>',

            '</div>'
        ].join('\n');
    }

    FilterTagsController.$inject = ['DecisionSharedService', 'DecisionNotificationService', 'Utils'];

    function FilterTagsController(DecisionSharedService, DecisionNotificationService, Utils) {
        var vm = this,
            _fo;
        vm.removeTag = removeTag;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        var filterNameTag;
        function onInit() {
            vm.tags = [];
            subscribe();
        }

        function onChanges(changes) {
            // console.log(changes.criteria);
            if(changes.criteria && changes.criteria.currentValue) {
                generateCriteriaTags(changes.criteria.currentValue);
            }
        }

        // Criteria
        var criteriaSelectedList = [];
        vm.removeCriteriaTag = removeCriteriaTag;

        function removeCriteriaTag(criteria) {

            DecisionDataService.getDecisionMatrix(vm.id, sendData).then(function(result) {
                DecisionNotificationService.notifySelectCriterion(result.decisionMatrixs);
            });
        }

        function generateCriteriaTags(criteria) {
            criteriaSelectedList = [];
            _.forEach(criteria, function(group) {
                _.forEach(group.criteria, function(criteriaItem) {
                    if(criteriaItem.isSelected === true) {
                        criteriaSelectedList.push(criteriaItem);
                    }
                });
            });

            if(!angular.equals(vm.criteriaTags, criteriaSelectedList)) {
                vm.criteriaTags = criteriaSelectedList;
                updateFilterStyles();
            }
        }
        // End Criteria

        function subscribe() {
            DecisionNotificationService.subscribeFilterTags(function(event, data) {
                // TODO: use seletedValue
                // console.log(vm.characteristics);
                if (data.id === -1) {
                    var filterByNameTag = {
                        'id': -1,
                        'characteristicId': -1,
                        'name': 'Name',
                        'value': [data.value],
                    };
                    if(_.isNull(data.value)) {
                        filterNameTag = null;
                        removeTag(filterByNameTag); 
                        return;
                    }
                    filterNameTag = filterByNameTag;
                    // vm.tags.push(filterByNameTag);
                    createTagsList(filterByNameTag);
                    return;
                }  

                _fo = angular.copy(data);
                if (_fo) createTagsList(_fo.filterQueries);
            });
        }

        var filter = $('#filter-tags');
        function updateFilterStyles() {
            // TODO: avoid jquery
            var matrixMargin = filter.outerHeight();
            if (vm.tags.length === 1 || vm.criteriaTags.length > 0) {
                matrixMargin = 30;
            } else if(_.isEmpty(vm.tags) && _.isEmpty(vm.criteriaTags)) {
                matrixMargin = 0;
            }

            $('.matrix-body-wrapper').css('margin-top', matrixMargin);            
        }

        // TODO: remove logic
        // Optimize
        function removeTag(item, value) {
            var itemCopy = angular.copy(item);

            if(itemCopy.characteristicId === -1) {
                DecisionNotificationService.notifyFilterByName(null);
                var index = _.findIndex(vm.tags, function(tag) {
                    return tag.id === -1;
                });
                if(index >=0) vm.tags.splice(index, 1);
                filterNameTag = undefined;
            }


            if (item.type === "RangeQuery") {
                itemCopy.value = null;
                updateFilterObject(itemCopy);
                return;
            }

            if (item.value && _.isArray(item.value)) { //Checkboxes
                Utils.removeItemFromArray(value, itemCopy.value);
            } else if (_.isArray(itemCopy.queries)) {
                var find = _.findIndex(itemCopy.queries, function(query) {
                    return query.value === value;
                });
                if (find >= 0) itemCopy.queries.splice(find, 1);
                if (_.isEmpty(itemCopy.queries) ||
                    value.indexOf('-') >= 0) {
                    itemCopy.queries = null;
                    itemCopy.value = null;
                }
            } else {
                itemCopy.value = null;
            }

            itemCopy = _.omit(itemCopy, 'data');
            if (_.isEmpty(itemCopy)) itemCopy = null;

            // TODO: clean up
            var sendItemCopy = _.omit(itemCopy, 'data', 'name', 'valueType');
            updateFilterObject(sendItemCopy);
            updateFilterStyles();
        }

        function updateFilterObject(query) {
            // TODO: avoid string
            if(query.id === -1) {
                DecisionNotificationService.subscribeFilterByName(null);
                return;
            }
            DecisionNotificationService.notifySelectCharacteristic({
                'filterQueries': query
            });
        }

        // TODO: clean up find
        function findCharacteristic(id) {
            var findCharacteristic;
            _.forEach(vm.characteristics, function(group) {
                var find = _.findLast(group.characteristics, function(characteristic) {
                    // console.log(characteristic.id, id, characteristic.id === id)
                    return characteristic.id === id;
                });
                if(find) findCharacteristic = find;
            });
            if(findCharacteristic) return _.pick(findCharacteristic, 'name', 'valueType');
        }

        function createTagsList(filterQueries) {
            if (_.isEmpty(filterQueries)) return;
            // TODO: Always regenerate new array 
            // Update it
            var tags = [];
            if(_.isArray(filterQueries)) {
                _.forEach(filterQueries, function(item) {
                    var find = findCharacteristic(item.characteristicId);
                    item = _.merge(item, find);
                    if (!_.isEmpty(item)) tags.push(caseQueryType(item));
                });
            }

            if(filterNameTag) tags.push(caseQueryType(filterNameTag));
            vm.tags = tags;
        }


        function caseQueryType(item) {
            var data = [];
            // TODO: use Switch Case ?!
            if(item.valueType && item.valueType.toLowerCase() === 'datetime') {
                data[0] = Utils.dateToUI(item.value[0]) + ' - ' + Utils.dateToUI(item.value[1]);
            } else if(item.valueType && item.valueType.toLowerCase() === 'boolean') { 
                if (item.value === true) data[0] = 'Yes';
                if (item.value === false) data[0] = 'No';
            } else if(item.type && item.type.toLowerCase() === 'rangequery') {
                data[0] = item.value[0] + ' - ' + item.value[1];
            } else {
                data = _.isArray(item.value) ? item.value : [item.value];
            }
            item.data = data;
            return item;
        }
    }

})();