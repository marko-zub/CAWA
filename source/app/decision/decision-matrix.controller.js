(function() {
    'use strict';
    angular.module('app.decision').controller('DecisionMatrixController', DecisionMatrixController);
    DecisionMatrixController.$inject = ['DecisionDataService', 'DecisionSharedService', '$state', '$stateParams',
        'DecisionNotificationService', 'decisionBasicInfo', '$rootScope', '$scope', 'DecisionCriteriaCoefficientsConstant',
        '$uibModal', '$sce', 'Utils', 'DiscussionsNotificationService'
    ];

    function DecisionMatrixController(DecisionDataService, DecisionSharedService, $state, $stateParams,
        DecisionNotificationService, decisionBasicInfo, $rootScope, $scope, DecisionCriteriaCoefficientsConstant,
        $uibModal, $sce, Utils, DiscussionsNotificationService) {
        var vm = this,
            criteriaIds = [],
            _fo = DecisionSharedService.filterObject,
            characteristicGroupsArrayOriginal;


        // TODO: simplify conttoller and move to different componnts
        vm.$onInit = onInit;

        function onInit() {
            console.log('Decision Matrix Controller');

            vm.filterName = null;

            vm.characteristicLimit = 4;

            // vm.id = $stateParams.id;
            vm.decision = decisionBasicInfo || {};
            $rootScope.pageTitle = vm.decision.name + ' Matrix | DecisionWanted';

            vm.decisionsSpinner = true;

            // Reser filters
            _fo = DecisionSharedService.setCleanFilterObject();

            // First call
            // 1. Render criteria and decisions for fast delivery info for user
            vm.characteristicGroupsContentLoader = true;
            getCriteriaGroupsById(vm.decision.id).then(function(criteriaResp) {

                getDecisionMatrix(vm.decision.id).then(function(matrixResp) {
                    initMatrixScroller();
                    // Render html matrix
                    var decisionMatrixs = matrixResp.decisionMatrixs;
                    // 2. render list of criterias
                    // createMatrixContentCriteria(decisionMatrixs);
                    renderMatrix();

                    // Init only first time
                    initSorters(); //Hall of fame
                    initMatrixMode();
                });


                loadCharacteristics();


            });
        }

        var isloadCharacteristics = false;

        function loadCharacteristics() {

            getCharacteristicsGroupsById(vm.decision.id).then(function(resp) {
                // 3. Render characteristics
                prepareCharacteristicsGroups(resp);
                renderMatrix(true);
                vm.characteristicGroupsContentLoader = false;
            });

            // isloadCharacteristics = true;

            // $scope.$applyAsync(function() {
            //     // vm.characteristicLimit = vm.characteristicGroups.length;
            //     // console.log(vm.characteristicLimit);

            //     vm.characteristicGroupsContentLoader = false;
            // });
        }


        // TODO: move to separate component
        // Filter name
        vm.clearFilterName = clearFilterName;
        vm.filterNameSubmit = filterNameSubmit;
        vm.filterNameSubmitClick = filterNameSubmitClick;
        vm.controlOptions = {
            debounce: 50
        };

        function clearFilterName() {
            vm.filterName = null;
            filterNameSend(null);
        }

        function filterNameSubmit(event, value) {
            if (event.keyCode === 13) {
                filterNameSend(value);
                event.preventDefault();
            }
        }

        function filterNameSend(value) {

            DecisionNotificationService.notifyFilterByName(value);

            // Send to filter tags
            var tag = {
                'name': 'Name',
                'characteristicId': -1,
                'value': value || null
            };
            DecisionNotificationService.notifyFilterTags(tag);
        }

        function filterNameSubmitClick(value) {
            // if (!value) return;
            // TODO: first request if ng-touched
            filterNameSend(value);
        }
        // End Filter name

        DecisionNotificationService.subscribeUpdateMatrixSize(function(event, data) {
            initMatrix(true);
        });

        //Subscribe to notification events
        DecisionNotificationService.subscribeSelectCriteria(function(event, data) {
            formDataForSearchRequest(data, data.coefCall);
            // DecisionSharedService.filterObject.persistent = true;
            getDecisionMatrix(vm.decision.id).then(function(result) {
                initSorters();
                initMatrix(result.decisionMatrixs, true);
            });
        });

        DecisionNotificationService.subscribePageChanged(function() {
            getDecisionMatrix(vm.decision.id).then(function(result) {
                initMatrix(result.decisionMatrixs, true);
            });
        });

        DecisionNotificationService.subscribeChildDecisionExclusion(function() {
            getDecisionMatrix(vm.decision.id).then(function(result) {
                initMatrix(result.decisionMatrixs, true);
            });
        });

        DecisionNotificationService.subscribeGetDetailedCharacteristics(function(event, data) {
            data.detailsSpinner = true;
            DecisionDataService.getDecisionCharacteristics(vm.decision.id, data.id).then(function(result) {
                data.characteristics = prepareDataToDisplay(result);
            }).finally(function() {
                data.detailsSpinner = false;
            });
        });

        DecisionNotificationService.subscribeSelectSorter(function(event, data) {
            // TODO: clean up DecisionSharedService in controller maake one object
            DecisionSharedService.filterObject.sorters[data.mode] = data.sort;
            DecisionSharedService.filterObject.persistent = true;
            getDecisionMatrix(vm.decision.id).then(function(result) {
                initMatrix(result.decisionMatrixs);
            });
        });

        DecisionNotificationService.subscribeSelectCharacteristic(function(event, data) {
            var query = data.query;
            // if (!data.filterQueries) return;
            var sendFo = DecisionSharedService.filterObject;
            sendFo.persistent = true;
            //TODO: Clean up code
            if (!sendFo.filterQueries)
                sendFo.filterQueries = [];

            var find = _.findIndex(sendFo.filterQueries, function(filterQuery) {
                return filterQuery.characteristicId == query.filterQueries.characteristicId;
            });
            if (find >= 0) {
                // TODO: find better solution
                if (!_.isBoolean(query.filterQueries.value) && _.isEmpty(query.filterQueries.value) &&
                    _.isEmpty(query.filterQueries.queries)) {
                    sendFo.filterQueries.splice(find, 1);

                } else {
                    sendFo.filterQueries[find] = query.filterQueries;
                }
            } else {
                sendFo.filterQueries.push(query.filterQueries);
            }

            if (_.isEmpty(sendFo.filterQueries) ||
                (_.isArray(sendFo.filterQueries.value) && _.isEmpty(sendFo.filterQueries.value))) {
                sendFo.filterQueries = null;
            }
            sendFo.filterQueries = filterObjectClearConditionCharacterisctics(sendFo.filterQueries, query.filterQueries);

            getDecisionMatrix(vm.decision.id).then(function(result) {
                initMatrix(result.decisionMatrixs, true);
            });
            setCharacteristicChanges(query.filterQueries, data.optionId);
        });

        DecisionNotificationService.subscribeFilterByName(function(event, data) {
            _fo.decisionNameFilterPattern = _.escape(data) || null;
            getDecisionMatrix(vm.decision.id).then(function(result) {
                initMatrix(result.decisionMatrixs, true);
                vm.filterName = data;
            });
        });

        function filterObjectClearConditionCharacterisctics(filterQueries, query) {
            // if (!query.value) return filterQueries;
            var removeCharacteristics = [];
            _.forEach(characteristicGroupsArrayOriginal, function(characteristic) {
                if ((characteristic.parentCharacteristicId && characteristic.parentCharacteristicId >= 0) &&
                    characteristic.parentCharacteristicId === query.characteristicId) {
                    removeCharacteristics.push(characteristic.id);
                }
            });

            if (!_.isEmpty(removeCharacteristics)) {
                filterQueries = _.filter(filterQueries, function(filterQuery) {
                    if (!_.includes(removeCharacteristics, filterQuery.characteristicId)) return filterQuery;
                });
            }

            return filterQueries;
        }


        // Discussions Subscrive
        vm.isCommentsOpen = false;
        DiscussionsNotificationService.subscribeOpenDiscussion(function(event, data) {
            vm.isCommentsOpen = true;
        });


        var selectedCharacteristicsIds = [];
        var selectedOptionsIds = [];

        function setCharacteristicChanges(characteristic, optionId) {
            if (!characteristic) return;

            // if (optionId >= 0 && !_.includes(selectedOptionsIds, optionId)) selectedOptionsIds.push(optionId);

            var characteristicCopy = angular.copy(characteristic);
            var value = characteristicCopy.value;
            if (characteristicCopy.queries && !characteristicCopy.value) {
                value = _.map(characteristicCopy.queries, function(query) {
                    return query.value;
                });
            }

            var characteristicGroups = angular.copy(vm.characteristicGroupsArray);
            var find = _.findIndex(characteristicGroups, function(characteristicFind) {
                // console.log(characteristicFind);
                if (characteristicFind.characteristicGroupId && characteristicFind.characteristicGroupId >= 0) {
                    return characteristicFind.id == characteristic.characteristicId;
                }
            });

            if (find >= 0) {
                characteristicGroups[find].selectedValue = value;
                if (optionId >= 0) characteristicGroups[find].optionId = optionId;
            }

            // Pick all optionIDs
            // TODO: use servise Filer Object
            // Simplify logic
            selectedCharacteristicsIds = [];
            selectedOptionsIds = [];
            _.forEach(characteristicGroups, function(characteristicItem) {
                if (characteristicItem.selectedValue) {
                    selectedCharacteristicsIds.push(characteristicItem.id);
                    if (characteristicItem.optionId && characteristicItem.optionId >= 0) {
                        selectedOptionsIds.push(characteristicItem.optionId);
                    }
                }
            });

            // Condition select controls
            var characteristicGroupsFull = angular.copy(characteristicGroupsArrayOriginal);
            characteristicGroups = _.filter(characteristicGroups, function(characteristic, index) {
                if (characteristic.parentCharacteristicId) {
                    if (_.includes(selectedCharacteristicsIds, characteristic.parentCharacteristicId)) {
                        characteristic.disabled = false;
                        characteristic.options = pickChildOptions(characteristicGroupsFull[index].options, selectedOptionsIds, characteristic.selectedValue);
                        // console.log(characteristicGroupsFull[index].options, characteristic.options)
                    } else {
                        characteristic.selectedValue = null;
                        characteristic.disabled = true;
                    }
                }
                return characteristic;
            });

            vm.characteristicGroupsArray = angular.copy(characteristicGroups);
        }

        function pickChildOptions(options, optionsIds, selected) {
            if (!options) return;
            var optionsFiltered = [];
            _.forEach(options, function(option) {
                if (option.parentOptionIds) {
                    var parentOptionIdsInArray = _.intersection(optionsIds, option.parentOptionIds);
                    if (selected && !_.isEmpty(parentOptionIdsInArray)) {
                        optionsFiltered.push(option);
                    } else if (!selected && !_.isEmpty(parentOptionIdsInArray) && parentOptionIdsInArray.length === optionsIds.length) {
                        optionsFiltered.push(option);
                    }

                }
            });

            return optionsFiltered;

        }

        function getCriteriaGroupsById(id) {
            return DecisionDataService.getCriteriaGroupsById(id).then(function(result) {
                criteriaIds = [];
                // Fill all criterias
                var criteriaSize = [];
                var criteriaGroups = _.filter(result, function(criteriaItem) {
                    criteriaSize.push(criteriaItem.criteria.length);
                    _.map(criteriaItem.criteria, function(criteria) {
                        if (criteria.description && !_.isObject(criteria.description)) {
                            criteria.description = $sce.trustAsHtml(criteria.description);
                        }
                        criteriaIds.push(criteria.id);
                        return criteria;
                    });
                    return criteriaItem;
                });

                vm.criteriaGroups = angular.copy(criteriaGroups);
                if (_.isEmpty(vm.criteriaGroups)) return;

                // / titles + criteria col height + characteristic wrapper
                var criteriahHeight = criteriaSize.length * 24 + _.sum(criteriaSize) * 49 + 100;
                // console.log(criteriahHeight);
                setMatrixTableHeight(criteriahHeight);

                if ($state.params.analysisId === 'hall-of-fame') {
                    _fo.selectedCriteria.sortCriteriaIds = criteriaIds;
                    _fo.persistent = false;
                    DecisionSharedService.changeFilterObject(_fo);
                }

                // TOOD: check if work correct
                return result;
            });
        }

        function getCharacteristicsGroupsById(uid) {
            return DecisionDataService.getCharacteristicsGroupsById(uid).then(function(result) {
                return result;
            });
        }

        function prepareCharacteristicsGroups(result) {
            var characteristicsArray = [];

            var total = 0;
            _.forEach(result, function(resultEl) {
                total += resultEl.characteristics.length;

                var group = _.omit(resultEl, 'characteristics');
                group.uuid = 'char-g-' + group.id;
                characteristicsArray.push(group);
                resultEl.characteristics = _.sortBy(resultEl.characteristics, 'createDate');

                _.map(resultEl.characteristics, function(characteristicsItem) {
                    if (characteristicsItem.description && !_.isObject(characteristicsItem.description)) {
                        characteristicsItem.description = $sce.trustAsHtml(characteristicsItem.description);
                    }

                    if (characteristicsItem.valueType === 'STRINGARRAY' ||
                        characteristicsItem.valueType === 'INTEGERARRAY') {
                        characteristicsItem.isSortable = false;
                    } else {
                        characteristicsItem.isSortable = true;
                    }
                    characteristicsItem.uuid = 'char-' + group.id + '-' + characteristicsItem.id;

                    // Condition characterisctis
                    // TODO: if parent selecte then enable characteristic
                    if (characteristicsItem.parentCharacteristicId) {
                        characteristicsItem.disabled = true;
                    }

                    characteristicsItem.parentId = group.id;

                    characteristicsArray.push(characteristicsItem);
                    return characteristicsItem;
                });
                return resultEl;
            });



            // TODO: finalize Superfast ng-repeat
            // Make some batch load for ng-repeat
            // for (var i = 0; i < characteristicsArraySize.length; i++) {
            //     vm.characteristicGroupsArray = chunkCollection(characteristicsArray, 20);
            // }
            // vm.characteristicGroupsArray = [];

            // var chunked = _.chunk(characteristicsArray, 5);
            // for (var i = 0; i < chunked.length; i++) {
            //     vm.characteristicGroupsArray = _.concat(vm.characteristicGroupsArray, chunked[i]);
            // }


            vm.characteristicGroupsArray = characteristicsArray;
            characteristicGroupsArrayOriginal = angular.copy(characteristicsArray);
            // console.log(vm.characteristicGroupsArray, _.uniq(vm.characteristicGroupsArray));
        }

        //Init sorters, when directives loaded
        function initSorters() {
            // Set filter by name
            _fo = DecisionSharedService.getFilterObject();
            _fo.pagination.totalDecisions = vm.decisions.totalDecisionMatrixs;
            vm.fo = angular.copy(_fo.sorters);
            // Set Criteria for Hall of fame
            var copyCriteria = _.filter(vm.criteriaGroups, function(criteriaGroupsArray) {
                _.map(criteriaGroupsArray.criteria, function(el) {
                    if (_.includes(_fo.selectedCriteria.sortCriteriaIds, el.id)) {
                        el.isSelected = true;
                        // Set criteria coefficient el.coefficient.
                        _.filter(_fo.selectedCriteria.sortCriteriaCoefficients, function(value, key) {
                            if (el.isSelected && parseInt(key) === el.id) {
                                var coefficientNew = findCoefNameByValue(value);
                                el.coefficient = coefficientNew;
                            }
                        });
                    } else {
                        el.isSelected = false;
                    }
                    return el;
                });
                return criteriaGroupsArray;
            });

            vm.criteriaGroups = angular.copy(copyCriteria);
        }

        function findCoefNameByValue(valueSearch) {
            valueSearch = valueSearch;
            return _.find(DecisionCriteriaCoefficientsConstant.COEFFICIENT_LIST, function(record) {
                return record.value == valueSearch;
            });
        }

        // TODO: optimize avoid Reflow!
        // Very slow loop
        var matrixAsideRow,
            matrixRows;
        matrixAsideRow = document.getElementsByClassName('js-item-aside');
        matrixRows = document.getElementsByClassName('js-matrix-item-content');

        var matrixAsideRowH = [];
        var matrixRowsH = [];

        function calcMatrixRowHeight() {
            var matrixSizes = [];
            $('.js-item-aside').css('height', 'auto');
            $('.js-matrix-item-content').css('height', 'auto');

            var asideArray = [],
                contentArray = [];
            if (!matrixRows.length) return;
            for (var i = 0; i < matrixRows.length; i++) {
                var el,
                    elAside,
                    newH;

                el = matrixRows[i];
                elAside = matrixAsideRow[i]; //TODO: Pofiler 600ms in slow PC

                newH = (elAside.clientHeight >= el.clientHeight) ? elAside.clientHeight : el.clientHeight;
                matrixSizes.push(newH);
                // Set new height
                el.style.height = newH + 'px';
                elAside.style.height = newH + 'px';
            }

            // applySizes(matrixSizes);
        }

        function applySizes(matrixSizes) {
            var titleH = 24;
            var matrixSizesCopy = angular.copy(matrixSizes);
            var characteristicsCopy = angular.copy(vm.characteristicGroups);

            _.forEach(characteristicsCopy, function(group) {
                var array = matrixSizesCopy.splice(0, group.characteristics.length);
                var size = _.sum(array) + titleH;
                $('.matrix-g-characteristics[data-characteristic-group=' + group.id + ']').css({
                    'height': size
                });
            });

            for (var i = 0; i < matrixSizes.length; i++) {
                matrixRows[i].style.height = matrixSizes[i] + 'px';
                matrixAsideRow[i].style.height = matrixSizes[i] + 'px';
            }

            // var characteristicsHeight = _.sum(matrixSizes) + characteristicsCopy.length*24;
            // $('.characteristic-groups-content').css('height', characteristicsHeight);
        }

        // TODO: drop settimeout and apply
        // Need only for first time load
        function renderMatrix(calcHeight) {
            setTimeout(function() {
                if (calcHeight !== false) calcMatrixRowHeight();
                reinitMatrixScroller();
            }, 0);
            $scope.$applyAsync(function() {
                vm.decisionsSpinner = false;
            });
        }

        function getDecisionMatrix(id, persistent) {
            vm.decisionsSpinner = true;
            var sendData = DecisionSharedService.getRequestFilterObject();
            if (persistent === true) sendData.persistent = true;

            sendData.includeCharacteristicIds = [-1];

            return DecisionDataService.getDecisionMatrix(id, sendData).then(function(result) {
                vm.decisions = result;
                vm.decisionMatrixList = prepareMatrixData(vm.decisions.decisionMatrixs);
                prevTotal = vm.decisionMatrixList.length;
                setMatrixTableWidth(vm.decisionMatrixList.length);

                // Update data if decision matrix response success
                DecisionNotificationService.notifyFilterTags(sendData);

                return result;
            });
        }

        function initMatrix(data, calcHeight) {
            // var performance = window.performance;
            // var t0 = performance.now();
            // var t1 = performance.now();
            // console.log("Call create matrix " + (t1 - t0) + " milliseconds.");
            initSorters();
            renderMatrix(calcHeight);

            initIncExcCounters();
        }

        function prepareMatrixData(data) {
            var dataCopy = angular.copy(data);
            return _.map(dataCopy, function(decisionMatrixEl) {
                if (!decisionMatrixEl.decision.imageUrl) decisionMatrixEl.decision.imageUrl = '/images/noimage.jpg';
                if (decisionMatrixEl.decision.description && !_.isObject(decisionMatrixEl.decision.description)) decisionMatrixEl.decision.description = $sce.trustAsHtml(decisionMatrixEl.decision.description);
                if (decisionMatrixEl.decision.criteriaCompliancePercentage >= 0) {
                    decisionMatrixEl.decision.criteriaCompliancePercentage = _.floor(decisionMatrixEl.decision.criteriaCompliancePercentage, 2);
                }
                return _.pick(decisionMatrixEl, 'decision');
            });
        }
        // TODO: make as in sorter directive
        vm.orderByDecisionProperty = orderByDecisionProperty;
        vm.orderByCharacteristicProperty = orderByCharacteristicProperty;
        vm.orderByCriteriaProperty = orderByCriteriaProperty;

        // TODO: make as component
        // Simplify sortObj
        // DNRY
        function orderByDecisionProperty(field, order) {
            if (!field) return;
            var sortObj = {
                sort: {
                    id: field,
                    order: (order === 'ASC' || !order) ? 'DESC' : 'ASC'
                },
                mode: "sortByDecisionProperty"
            };
            DecisionNotificationService.notifySelectSorter(sortObj);
        }

        function orderByCriteriaProperty(order, $event) {
            var sortObj;
            sortObj = {
                sort: {
                    order: (order === 'ASC' || !order) ? 'DESC' : 'ASC'
                },
                mode: "sortByCriteria"
            };
            DecisionNotificationService.notifySelectSorter(sortObj);
            var parentCriteria = $($event.target).parents('.matrix-item');
            if (parentCriteria.hasClass('selected')) {
                $event.stopPropagation();
            }
        }

        function orderByCharacteristicProperty(field, order) {
            if (!field) return;
            var sortObj;
            order = (order === 'ASC' || !order) ? 'DESC' : 'ASC';
            sortObj = {
                sort: {
                    id: field,
                    order: order
                },
                mode: "sortByCharacteristic"
            };
            DecisionNotificationService.notifySelectSorter(sortObj);
        }

        var characteristicsBlock = $('#matrix-content');

        function updatePosition(martrixScroll) {
            var _this = martrixScroll || this; // jshint ignore:line
            scrollHandler(_this.y, _this.x);
            $('.matrix-g .app-control').toggleClass('selected', false);
        }

        // Table scroll
        var tableBody,
            tableHeader,
            tableAside;
        tableAside = document.getElementById('matrix-aside-content');
        tableHeader = document.getElementById('matrix-scroll-group');

        function scrollHandler(scrollTop, scrollLeft) {
            tableAside.style.top = scrollTop + 'px';
            tableHeader.style.left = scrollLeft + 'px';
        }
        // Custom scroll
        var martrixScroll;

        function initMatrixScroller() {
            var wrapper = document.getElementById('matrix-body');
            martrixScroll = new IScroll(wrapper, {
                scrollbars: true,
                scrollX: true,
                scrollY: true,
                mouseWheel: true,
                interactiveScrollbars: true,
                shrinkScrollbars: 'scale',
                fadeScrollbars: false,
                probeType: 3,
                useTransition: false,
                bindToWrapper: true,
                disablePointer: true,
                disableTouch: false,
                // bounce: false,
                momentum: false,
                disableMouse: false
            });
        }


        function reinitMatrixScroller() {
            // TODO: avoid jquery height
            if (martrixScroll) {
                martrixScroll.refresh();
                martrixScroll.on('scroll', updatePosition);
                updatePosition(martrixScroll);
            }
        }

        var prevTotal;

        function setMatrixTableWidth(total) {
            var tableWidth = total * 200 + 'px';
            var table = document.getElementById('matrix-content');
            table.style.width = tableWidth;

        }

        function setMatrixTableHeight(height) {
            $('#matrix-content').css('min-height', height);
        }
        // TODO: make as a separeted component
        // Criteria header
        vm.editCriteriaCoefficient = editCriteriaCoefficient;

        function editCriteriaCoefficient(event, criteria) {
            if (!criteria) return;
            event.preventDefault();
            event.stopPropagation();
            var modalInstance = $uibModal.open({
                templateUrl: 'app/components/decisionCriteria/criteria-coefficient-popup.html',
                controller: 'CriteriaCoefficientPopupController',
                controllerAs: 'vm',
                backdrop: 'static',
                animation: false,
                resolve: {
                    criteria: function() {
                        return criteria;
                    }
                }
            });
            modalInstance.result.then(function(result) {
                var groupIndex = _.findIndex(vm.criteriaGroups, {
                    id: result.criterionGroupId
                });
                var criteriaIndex = _.findIndex(vm.criteriaGroups[groupIndex].criteria, {
                    id: result.id
                });
                vm.criteriaGroups[groupIndex].criteria[criteriaIndex] = result;
                selectCriteria(event, result, criteria.isSelected);
                vm.decisionsSpinner = false;
            });
        }
        vm.selectCriteria = selectCriteria;

        function selectCriteria(event, criteria, coefCall) {
            if ($(event.target).hasClass('title-descr')) return;
            vm.decisionsSpinner = true;
            if (coefCall && !criteria.isSelected) {
                return;
            }
            if (!coefCall) {
                criteria.isSelected = !criteria.isSelected;
            }

            criteria.coefCall = coefCall;
            DecisionNotificationService.notifySelectCriteria(criteria);
        }

        function formDataForSearchRequest(criteria, coefCall) {
            if (!criteria.id) return;

            var foSelectedCriteria = DecisionSharedService.getFilterObject().selectedCriteria;
            var position = foSelectedCriteria.sortCriteriaIds.indexOf(criteria.id);
            //select criteria
            if (position === -1) {
                foSelectedCriteria.sortCriteriaIds.push(criteria.id);
                //don't add default coefficient
                if (criteria.coefficient && criteria.coefficient.value !== DecisionCriteriaCoefficientsConstant.COEFFICIENT_DEFAULT.value) {
                    foSelectedCriteria.sortCriteriaCoefficients[criteria.id] = criteria.coefficient.value;
                }
                //add only coefficient (but not default)
            } else if (coefCall && criteria.coefficient.value !== DecisionCriteriaCoefficientsConstant.COEFFICIENT_DEFAULT.value) {
                foSelectedCriteria.sortCriteriaCoefficients[criteria.id] = criteria.coefficient.value;
                //unselect criteria
            } else {
                foSelectedCriteria.sortCriteriaIds.splice(position, 1);
                delete foSelectedCriteria.sortCriteriaCoefficients[criteria.id];
            }
            foSelectedCriteria.sortCriteriaIds = Utils.removeEmptyFromArray(foSelectedCriteria.sortCriteriaIds);

            _fo.selectedCriteria = foSelectedCriteria;
            DecisionSharedService.changeFilterObject(_fo);
        }

        // TODO: clean up optimize
        // Inclusion/Exclusion criteria
        vm.changeMatrixMode = changeMatrixMode;
        vm.updateExclusionList = updateExclusionList;
        vm.matrixMode = 'inclusion';

        function initIncExcCounters() {
            if (vm.matrixMode === 'inclusion') {
                vm.inclusionItemsLength = vm.decisions.totalDecisionMatrixs;
            } else if (vm.matrixMode === 'exclusion') {
                vm.exclusionItemsLength = vm.decisions.totalDecisionMatrixs;
            }
        }

        function initMatrixMode() {
            vm.exclusionItemsLength = 0;
            if (_fo.includeChildDecisionIds && _fo.includeChildDecisionIds.length > 0) {
                vm.exclusionItemsLength = _fo.includeChildDecisionIds.length;
            } else if (_fo.excludeChildDecisionIds && _fo.excludeChildDecisionIds.length > 0) {
                vm.exclusionItemsLength = _fo.excludeChildDecisionIds.length;
            }

            vm.inclusionItemsLength = vm.decisions.totalDecisionMatrixs;
        }

        function setMatrixModeCounters(mode) {
            // TODO: minimize code
            var inclusionItemsLength = vm.inclusionItemsLength >= 0 ? vm.inclusionItemsLength : vm.decisions.totalDecisionMatrixs;
            _fo = DecisionSharedService.filterObject;
            if (mode === 'inclusion') {
                _fo.excludeChildDecisionIds = _fo.includeChildDecisionIds;
                if (_.isEmpty(_fo.excludeChildDecisionIds)) {
                    _fo.excludeChildDecisionIds = null;
                }
                _fo.includeChildDecisionIds = null;
            } else if (mode === 'exclusion') {
                _fo.includeChildDecisionIds = _fo.excludeChildDecisionIds;
                vm.exclusionItemsLength = _.isArray(_fo.includeChildDecisionIds) ? _fo.includeChildDecisionIds.length : 0;
                _fo.excludeChildDecisionIds = null;
                if (vm.exclusionItemsLength === 0) {
                    _fo.includeChildDecisionIds = [];
                }
            }
            vm.inclusionItemsLength = inclusionItemsLength;
        }

        function changeMatrixMode(mode) {
            var allowMode = ['inclusion', 'exclusion'];
            if (_.includes(allowMode, mode)) {
                vm.matrixMode = mode;
                setMatrixModeCounters(mode);

                var send_fo = _fo;
                send_fo.persistent = false;
                DecisionNotificationService.notifyChildDecisionExclusion(send_fo);
            }
        }

        function updateExclusionList(id) {
            if (!id) return;
            if (vm.matrixMode === 'inclusion') {
                _fo.excludeChildDecisionIds = _fo.excludeChildDecisionIds ? _fo.excludeChildDecisionIds : [];
                Utils.addItemToArray(parseInt(id), _fo.excludeChildDecisionIds);
                vm.exclusionItemsLength = _fo.excludeChildDecisionIds.length;
                vm.inclusionItemsLength--;
            } else if (vm.matrixMode === 'exclusion') {
                Utils.removeItemFromArray(parseInt(id), _fo.includeChildDecisionIds);
                vm.exclusionItemsLength = _fo.includeChildDecisionIds.length;
                vm.inclusionItemsLength++;
            }

            var send_fo = _fo;
            send_fo.persistent = true;
            DecisionNotificationService.notifyChildDecisionExclusion(send_fo);
        }


        // Toggle group
        vm.toggleGroupName = toggleGroupName;

        function toggleGroupName($event, id, type) {
            $($event.target).toggleClass('closed');
            // TYPES: 'characteristic', 'criteria'
            if (!type) type = 'criteria';
            // TODO: avoid class js-toggle-hide
            // Optimize function to toggle
            $('[data-' + type + '-group="' + id + '"]').find('.js-toggle-hide').toggleClass('hide');

            // Incorect height calc
            initMatrix(true);

            $event.preventDefault();
        }
    }
})();