(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterTagsController', FilterTagsController)
        .component('filterTags', {
            bindings: {
                characteristics: '<',
                criteria: '<',
                // filterName: '<',
                filterObject: '<',
                onChangeCriteriaOrder: '&'
            },
            templateUrl: 'app/components/filterTags/filter-tags.html',
            controller: 'FilterTagsController',
            controllerAs: 'vm'
        });


    FilterTagsController.$inject = ['DecisionSharedService', 'DecisionNotificationService', 'Utils', '$scope'];

    function FilterTagsController(DecisionSharedService, DecisionNotificationService, Utils, $scope) {
        var vm = this,
            _fo;
        vm.removeTag = removeTag;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;
        vm.changeCriteriaProperty = changeCriteriaProperty;

        var filterByNameTag = {
            'id': -1,
            'characteristicId': -1,
            'name': 'Name'
        };

        function onInit() {
            // console.log(vm.criteriaOrder);
            vm.tags = [];
            subscribe();
        }

        function onChanges(changes) {
            // console.log(vm.filterObject);
            // Characteristics
            // if(changes.characteristics && changes.characteristics.currentValue) {
            //     vm.characteristics = angular.copy(changes.characteristics.currentValue);
            //     generateCharacteristicsTags(vm.characteristics);
            // }

            // Criteria
            if (changes.criteria && changes.criteria.currentValue) {
                vm.criteria = angular.copy(changes.criteria.currentValue);
                generateCriteriaTags(vm.criteria);
            }

            // Filter Name
            // if(changes.filterName && changes.filterName.currentValue) {
            //     // vm.tags.push()

            //     if(_.isNull(changes.filterName.currentValue)) {
            //         removeTag(filterByNameTag);
            //     } else {
            //         filterByNameTag.value = changes.filterName.currentValue;
            //         vm.tags.push(filterByNameTag);
            //     }
            // }
        }

        // Criteria
        var criteriaSelectedList = [];
        vm.removeCriteriaTag = removeCriteriaTag;

        function removeCriteriaTag(criteria) {
            criteria.isSelected = false;
            DecisionNotificationService.notifySelectCriteria(criteria);
        }

        function generateCriteriaTags(criteria) {
            criteriaSelectedList = [];
            _.forEach(criteria, function(group) {
                _.forEach(group.criteria, function(criteriaItem) {
                    if (criteriaItem.isSelected === true) {
                        criteriaSelectedList.push(criteriaItem);
                    }
                });
            });

            if (!angular.equals(vm.criteriaTags, criteriaSelectedList)) {
                vm.criteriaTags = criteriaSelectedList;
                updateFilterStyles();
            }
        }
        // End Criteria

        function generateCharacteristicsTags(characteristics) {
            console.log(characteristics);
            _.forEach(characteristics, function(group) {
                _.forEach(group.characteristics, function(characteristic) {
                    console.log(characteristic.seletedValues);
                    // if(characteristics.seletedValues) console.log(characteristics.seletedValues);
                });
            });
        }


        function subscribe() {
            DecisionNotificationService.subscribeFilterTags(function(event, data) {
                // TODO: use seletedValue
                // console.log(vm.characteristics);
                _fo = angular.copy(data);
                if (_fo) createTagsList(_fo.filterQueries);
            });
        }

        function updateFilterStyles() {
            // TODO: avoid jquery

            // if (vm.tags.length === 1 || vm.criteriaTags.length === 1)) {
            //     matrixMargin = 30;
            // } else if(_.isEmpty(vm.tags) && _.isEmpty(vm.criteriaTags)) {
            //     matrixMargin = 0;
            // }

            setTimeout(function() {
                var filter = $('#filter-tags');
                var matrixMargin = filter.outerHeight();
                $('.matrix-body-wrapper').css('margin-top', matrixMargin);
            }, 0);
        }

        // TODO: remove logic
        // Optimize
        function removeTag(item, value) {
            var itemCopy = angular.copy(item);

            if (itemCopy.characteristicId === -1) {
                DecisionNotificationService.notifyFilterByName(null);
                var index = _.findIndex(vm.tags, function(tag) {
                    return tag.id === -1;
                });
                if (index >= 0) vm.tags.splice(index, 1);
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
            if (query.id === -1) {
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
                if (find) findCharacteristic = find;
            });
            if (findCharacteristic) return _.pick(findCharacteristic, 'name', 'valueType');
        }

        // TODO: Remove it
        // Always regenerate new array
        function createTagsList(filterQueries) {
            vm.tags = [];
            _.forEach(filterQueries, function(item) {
                var find = findCharacteristic(item.characteristicId);
                item = _.merge(item, find);
                if (!_.isEmpty(item)) vm.tags.push(caseQueryType(item));
            });
        }


        // function createTagsList(filterQueries) {
        //     if (_.isEmpty(filterQueries)) return;
        //     // TODO: Always regenerate new array
        //     // Update it
        //     if(_.isArray(filterQueries)) {
        //         _.forEach(filterQueries, function(item) {
        //             var itemInTags = _.find(vm.tags, function(tag){
        //                 return tag.characteristicId === item.characteristicId;
        //             });
        //             if(itemInTags < 0) {
        //                 var find = findCharacteristic(item.characteristicId);
        //                 item = _.merge(item, find);
        //                 if (!_.isEmpty(item)) vm.tags.push(caseQueryType(item));
        //             }
        //         });
        //     }
        // }


        function caseQueryType(item) {
            var data = [];
            // TODO: use Switch Case ?!
            if (item.valueType && item.valueType.toLowerCase() === 'datetime') {
                data[0] = Utils.dateToUI(item.value[0]) + ' - ' + Utils.dateToUI(item.value[1]);
            } else if (item.valueType && item.valueType.toLowerCase() === 'boolean') {
                if (item.value === true) data[0] = 'Yes';
                if (item.value === false) data[0] = 'No';
            } else if (item.type && item.type.toLowerCase() === 'rangequery') {
                data[0] = item.value[0] + ' - ' + item.value[1];
            } else {
                data = _.isArray(item.value) ? item.value : [item.value];
            }
            item.data = data;
            return item;
        }

        function changeCriteriaProperty(order, $event) {
            if (order === 'ASC') {
                order = 'DESC';
            } else {
                order = 'ASC';
            }
           
            vm.onChangeCriteriaOrder({
                order: order,
                $event: $event
            });
        }

    }

})();