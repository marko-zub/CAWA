(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterTagsController', FilterTagsController)
        .component('filterTags', {
            template: renderTemplate,
            controller: 'FilterTagsController',
            controllerAs: 'vm'
        });

    renderTemplate.$inject = [];

    function renderTemplate() {
        return [
            '<div class="tag-group" ng-repeat="tag in vm.tags track by tag.characteristicId">',
                '<span>{{::tag.characteristicName}}:</span>',
                '<div class="tag-wrapper" ng-repeat="tagVal in tag.data track by $index">',
                    '<div class="tag">',
                        '{{tagVal}}<span ng-click="vm.removeTag(tag, tagVal)" class="icon-remove"><i class="fa fa-times" aria-hidden="true"></i></span>',
                    '</div>',
                    '<span ng-if="::(tag.data.length > 1 && !$last)" ng-bind="tag.operator" class="tag-divider"></span>',
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

        }

        DecisionNotificationService.subscribeFilterTags(function(event, data) {
            _fo = angular.copy(data);
            if (_fo) createTagsList(_fo.filterQueries);
        });

        // TODO: remove logic
        // Optimize
        function removeTag(item, value) {
            var itemCopy = angular.copy(item);
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
                itemCopy.value = null;
            }
            itemCopy = _.omit(itemCopy, 'data');
            if (_.isEmpty(itemCopy)) itemCopy = null;
            updateFilterObject(itemCopy);
        }

        function updateFilterObject(query) {
            var sendData = {
                'filterQueries': query
            };
            DecisionNotificationService.notifySelectCharacteristic(sendData);
        }

        function createTagsList(filterQueries) {
            vm.tags = [];
            if (_.isEmpty(filterQueries)) return;
            _.forEach(filterQueries, function(item) {
                // TODO: optimize
                // Currently all data shared in view
                if (item.value === true) item.value = 'Yes';
                if (item.value === false) item.value = 'No';

                vm.tags.push(caseQueryType(item));
            });
        }
        // TODO: clean up
        function caseQueryType(item) {
            var data = [];
            switch (item.type) {
                case "CompositeQuery":
                    if (!_.isEmpty(item.queries)) {
                        if (item.queries[0].type == 'GreaterOrEqualQuery') {

                            // TODO: format date
                            if (_.isDate(item.queries[0].value) && _.isDate(item.queries[1].value)) {
                                item.queries[0].value = Utils.dateToUI(item.queries[0].value);
                                item.queries[1].value = Utils.dateToUI(item.queries[1].value);
                            }
                            // debugger
                            data[0] = item.queries[0].value + ' - ' + item.queries[1].value;
                        } else if (item.operator == 'OR') {
                            data = _.map(item.queries, function(query) {
                                return query.value;
                            });
                        }
                    }
                    break;
                default:
                    data = _.isArray(item.value) ? item.value : [item.value];
            }
            item.data = data;
            // debugger
            return item;
        }
    }

})();