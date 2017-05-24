(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterTagsController', FilterTagsController)
        .component('filterTags', {
            bindings: {
                characteristics: '<',
                criteria: '<',
                filterObject: '<',
                onChangeCriteriaOrder: '&'
            },
            templateUrl: 'app/components/filterTags/filter-tags.html',
            controller: 'FilterTagsController',
            controllerAs: 'vm'
        });


    FilterTagsController.$inject = ['DecisionSharedService', 'DecisionNotificationService', 'Utils', '$scope', '$element'];

    function FilterTagsController(DecisionSharedService, DecisionNotificationService, Utils, $scope, $element) {
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
            //     vm.characteristics = changes.characteristics.currentValue;
            //     generateCharacteristicsTags(vm.characteristics);
            // }

            // Criteria
            if (changes.criteria && changes.criteria.currentValue) {
                vm.criteria = angular.copy(changes.criteria.currentValue);
                generateCriteriaTags(vm.criteria);
            }
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
            }
        }
        // End Criteria

        function generateCharacteristicsTags(characteristics) {
            // console.log(characteristics);
            _.forEach(characteristics, function(group) {
                _.forEach(group.characteristics, function(characteristic) {
                    // console.log(characteristic);
                    // debugger
                    // if(characteristics.seletedValues) console.log(characteristics.seletedValues);
                });
            });
        }


        function subscribe() {
            DecisionNotificationService.subscribeFilterTags(function(event, data) {
                // TODO: use seletedValue
                // console.log(vm.characteristics);

                if (data.characteristicId === -1) {
                    if (_.isNull(data.value)) {
                        removeTag(data);
                    } else {
                        addToTagsList(data);
                    }
                    return;
                }

                // Parese Filter Object
                _fo = angular.copy(data);
                if (_fo) createTagsList(_fo.filterQueries);
            });
        }

        function updateFilterStyles() {
            var filter = $($element).find('#filter-tags');
            console.log(filter, filter.outerHeight());
            if (filter.length)
                $('.matrix-body-wrapper').css('margin-top', filter.outerHeight());

        }

        // TODO: update remove logic
        // Optimize
        function removeTag(item, value) {
            var itemCopy = angular.copy(item);
            var index = tagIndexInList(itemCopy.characteristicId);
            if (index < 0) return;


            if (index >= 0) {

                if (_.isUndefined(itemCopy.data)) {
                    itemCopy.value = null;
                }
                // All data in arrays [true], ['Value', 'Value2'], ['date1 - date2']
                // value can be length 2 [1, 100] 
                // but data = ["1 - 100"] lenght 1
                if (_.isArray(itemCopy.data) && itemCopy.data.length > 1) {
                    Utils.removeItemFromArray(value, itemCopy.data);
                    itemCopy.value = itemCopy.data;
                } else { //Checkboxes
                    vm.tags.splice(index, 1);
                    itemCopy.value = null;
                }

                // Filter Name
                if (itemCopy.characteristicId === -1) {
                    vm.tags.splice(index, 1);
                    itemCopy.value = null;
                    DecisionNotificationService.notifyFilterByName(null);
                    return;
                }
            }

            var sendItemCopy = _.omit(itemCopy, 'data', 'name', 'valueType');
            updateFilterObject(sendItemCopy);
            // debugger
        }

        function tagIndexInList(id) {
            return _.findIndex(vm.tags, function(tag) {
                return tag.characteristicId === id;
            });
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
                if (find) findCharacteristic = find;
            });
            if (findCharacteristic) return _.pick(findCharacteristic, 'name', 'valueType');
        }

        // TODO: Remove it
        // Always regenerate new array
        function createTagsList(filterQueries) {
            // Clear all tags
            vm.tags = _.filter(vm.tags, function(tag) {
                return tag.characteristicId === -1;
            });

            _.forEach(filterQueries, function(item) {
                addToTagsList(item);
            });

        }

        function addToTagsList(item) {
            if (!_.isEmpty(item)) {
                var find = findCharacteristic(item.characteristicId);
                item = _.merge(item, find);
                var index = tagIndexInList(item.characteristicId);
                if (index >= 0) {
                    vm.tags[index] = caseQueryType(item);
                } else {
                    vm.tags.push(caseQueryType(item));
                }
            }
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
            var defaultOrder = 'DESC';
            if (order === defaultOrder) defaultOrder = 'ASC';

            vm.onChangeCriteriaOrder({
                order: defaultOrder,
                $event: $event
            });
        }

    }

})();