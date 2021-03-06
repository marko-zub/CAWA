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
                onChangeCriteriaOrder: '&',
                onChangeCharacteristicsOrder: '&',
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
        vm.changeCriteriaOrder = changeCriteriaOrder;
        vm.changeCharacteristicsOrder = changeCharacteristicsOrder;

        var filterByNameTag = {
            'id': -1,
            'characteristicId': -1,
            'name': 'Name'
        };

        function onInit() {
            // console.log(vm.criteriaOrder);
            vm.tagsFilter = [];
            vm.tagsSort = [];
            subscribe();
        }

        function onChanges(changes) {
            // console.log(vm.filterObject);
            // Characteristics
            if (changes.characteristics &&
                !angular.equals(changes.characteristics.currentValue, changes.characteristics.previousValue)) {
                vm.characteristics = angular.copy(changes.characteristics.currentValue);
                // generateCharacteristicsTags(vm.characteristics);

                if (vm.characteristics && vm.sortByCharacteristic && !vm.sortByCharacteristic.name)
                    vm.sortByCharacteristic = setCharacteristicsSortTag(vm.sortByCharacteristic);
            }

            if (changes.filterObject &&
                !angular.equals(changes.filterObject.currentValue, changes.filterObject.previousValue)) {
                if (changes.filterObject.currentValue) {
                    vm.sortByCharacteristic = setCharacteristicsSortTag(changes.filterObject.currentValue.sortByCharacteristic);
                }

            }

            // Criteria
            if (changes.criteria && changes.criteria.currentValue) {
                vm.criteria = angular.copy(changes.criteria.currentValue);
                generateCriteriaTags(vm.criteria);
                updateMatrixHeight();
            }
        }

        function setCharacteristicsSortTag(characteristic) {
            if (!characteristic) return;
            var characteristicsOrderTag = angular.copy(characteristic);
            var findCharacteristics = Utils.findGroupItemById(characteristicsOrderTag.id, vm.characteristics, 'characteristics');
            characteristicsOrderTag.name = findCharacteristics ? findCharacteristics.name : '';
            // debugger
            return characteristicsOrderTag;
        }

        // Criteria
        vm.removeCriteriaTag = removeCriteriaTag;

        function removeCriteriaTag(criteria) {
            if (criteria.id < 0) {
                // console.log(criteria);
                return;
            }

            var criteriaCopy = criteria;
            criteriaCopy.isSelected = false;
            DecisionNotificationService.notifySelectCriteria(criteriaCopy);
        }

        function generateCriteriaTags(criteria) {
            var criteriaSelectedList = [];
            _.forEach(criteria, function(group) {
                _.forEach(group.criteria, function(criteriaItem) {

                    var find = _.findIndex(vm.tagsSort, function(tag) {
                        return tag.id === criteriaItem.id;
                    });
                    if (criteriaItem.isSelected === true && find < 0) {
                        vm.tagsSort.push(criteriaItem);
                    } else if (!criteriaItem.isSelected && find >= 0) {
                        vm.tagsSort.splice(find, 1);
                    }
                });
            });
            setTimeout(function() {
                updateMatrixHeight();
            }, 0);
        }
        // End Criteria

        function generateCharacteristicsTags(characteristics) {
            // console.log(characteristics);
            // _.forEach(characteristics, function(group) {
            _.forEach(characteristics, function(characteristic) {
                var find = _.findIndex(vm.tagsFilter, function(tag) {
                    return tag.id === characteristic.id;
                });
                if (characteristic.selectedValue && find < 0) {
                    vm.tagsFilter.push(characteristic);
                } else if (!characteristic.isSelected && find >= 0) {
                    vm.tagsFilter.splice(find, 1);
                }
            });
            // });
        }


        function subscribe() {
            DecisionNotificationService.subscribeFilterTags(function(event, data) {
                // TODO: use selectedValue
                // console.log(vm.characteristics);

                if (data.characteristicId === -1) {
                    if (_.isNull(data.value)) {
                        removeTag(data);
                    } else {
                        addToTagsList(data);
                    }
                    updateMatrixHeight();
                    return;
                }

                // Parese Filter Object
                _fo = angular.copy(data);
                if (_fo) {
                    createTagsList(_fo.filterQueries);
                    updateMatrixHeight();
                }
            });
        }

        function updateMatrixHeight() {
            var matrixHeaderHeight = $('.matrix-header').height();
            var height = $('#filter-tags').height() + matrixHeaderHeight;
            // - $('.martix-footer').height();

            if (height >= 0) {
                // console.log(height);
                $('#matrix-body-wrapper').css({
                    'top': height
                });
            }
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

                if (itemCopy.characteristicId === -1) {
                    itemCopy.value = null;
                    DecisionNotificationService.notifyFilterByName(null);
                    vm.tagsFilter.splice(index, 1);
                    return;
                }
                // All data in arrays [true], ['Value', 'Value2'], ['date1 - date2']
                // value can be length 2 [1, 100]
                // but data = ["1 - 100"] lenght 1
                if (_.isArray(itemCopy.data) && itemCopy.data.length > 1) {
                    Utils.removeItemFromArray(value, itemCopy.data);
                    itemCopy.value = itemCopy.data;
                } else { //Checkboxes
                    // vm.tagsFilter.splice(index, 1);
                    itemCopy.value = null;
                }

                // Filter Name

            }

            var sendItemCopy = _.omit(itemCopy, 'data', 'name', 'valueType');
            updateFilterObject(sendItemCopy);
        }

        function tagIndexInList(id) {
            return _.findIndex(vm.tagsFilter, function(tag) {
                return tag.characteristicId === id;
            });
        }

        function updateFilterObject(query) {

            var sendData = {
                query: {
                    'filterQueries': query
                }
            };
            DecisionNotificationService.notifySelectCharacteristic(sendData);
        }

        // TODO: clean up find
        function findCharacteristic(id) {
            var find = _.findLast(vm.characteristics, function(characteristic) {
                return characteristic.id === id;
            });

            if (find) return _.pick(find, 'name', 'valueType');
        }

        // TODO: Remove it
        // Always regenerate new array
        function createTagsList(filterQueries) {
            // Clear all tags
            vm.tagsFilter = _.filter(vm.tagsFilter, function(tag) {
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
                    vm.tagsFilter[index] = caseQueryType(item);
                } else {
                    vm.tagsFilter.push(caseQueryType(item));
                }
            }
        }


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

        function changeCriteriaOrder(order, $event) {
            vm.onChangeCriteriaOrder({
                'order': order,
                '$event': $event
            });
        }

        function changeCharacteristicsOrder(order, orderId) {
            var defaultOrder = 'DESC';
            if (order === defaultOrder) defaultOrder = 'ASC';
            var sortObj = {
                sort: {
                    id: orderId,
                    order: defaultOrder
                },
                mode: "sortByCharacteristic"
            };

            if (_.isNull(order)) {
                sortObj.sort.id = null;
                sortObj.sort.order = null;
            }
            // console.log(sortObj);
            DecisionNotificationService.notifySelectSorter(sortObj);
        }



    }

})();