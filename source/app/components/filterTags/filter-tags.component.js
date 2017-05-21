(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterTagsController', FilterTagsController)
        .component('filterTags', {
            bindings: {
                characteristics: '<'
            },
            template: renderTemplate,
            controller: 'FilterTagsController',
            controllerAs: 'vm'
        });

    renderTemplate.$inject = [];

    function renderTemplate() {
        return [
            '<div id="filter-tags" class="filter-tags" ng-show="vm.tags.length">',
                '<div class="filter-tags-label">Filtered by: </div>',
                '<div class="tag-group" ng-repeat="tag in vm.tags track by tag.characteristicId">',
                    '<span>{{::tag.name}}:</span>',
                    '<div class="tag-wrapper" ng-repeat="tagVal in tag.data track by $index">',
                        '<div class="tag">',
                        '{{tagVal}}<span ng-click="vm.removeTag(tag, tagVal)" class="icon-remove"><i class="fa fa-times" aria-hidden="true"></i></span>',
                    '</div><span ng-if="tag.data.length > 1 && !$last" ng-bind="tag.operator" class="tag-divider"></span>',
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

        function onInit() {
             subscribe();
        }

        function subscribe() {
            DecisionNotificationService.subscribeFilterTags(function(event, data) {
                _fo = angular.copy(data);
                if (_fo) createTagsList(_fo.filterQueries);

                // TODO: avoid jquery
                var matrixMargin = $('#filter-tags').outerHeight();
                if (vm.tags.length === 1) {
                    matrixMargin = 30;
                } else if(_.isEmpty(vm.tags)) {
                    matrixMargin = 0;
                }

                $('.matrix-body-wrapper').css('margin-top', matrixMargin);
            });            
        }

        // TODO: remove logic
        // Optimize
        function removeTag(item, value) {
            var itemCopy = angular.copy(item);

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
            updateFilterObject(itemCopy);
        }

        function updateFilterObject(query) {
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
            vm.tags = [];
            if (_.isEmpty(filterQueries)) return;

            _.forEach(filterQueries, function(item) {
                var find = findCharacteristic(item.characteristicId);
                item = _.merge(item, find);
                if (!_.isEmpty(item)) vm.tags.push(caseQueryType(item));
            });
            // console.log(vm.tags);
        }
        // TODO: clean up
        function caseQueryType(item) {
            var data = [];
            // TODO: use Switch Case ?!
            if(item.valueType.toLowerCase() === 'datetime') {
                data[0] = Utils.dateToUI(item.value[0]) + ' - ' + Utils.dateToUI(item.value[1]);
            } else if(item.valueType.toLowerCase() === 'boolean') { 
                if (item.value === true) data[0] = 'Yes';
                if (item.value === false) data[0] = 'No';
            } else if(item.type.toLowerCase() === 'rangequery') {
                data[0] = item.value[0] + ' - ' + item.value[1];
            } else {
                data = _.isArray(item.value) ? item.value : [item.value];
            }
            item.data = data;
            return item;
        }
    }

})();