(function() {
    'use strict';
    angular.module('app.decision').controller('DecisionMatrixController', DecisionMatrixController);
    DecisionMatrixController.$inject = ['DecisionDataService', 'DecisionSharedService', '$state', '$stateParams',
        'DecisionNotificationService', 'decisionBasicInfo', '$rootScope', '$scope', 'DecisionCriteriaCoefficientsConstant',
        '$uibModal', 'decisionAnalysisInfo', '$sce', 'Utils', 'DiscussionsNotificationService'
    ];

    function DecisionMatrixController(DecisionDataService, DecisionSharedService, $state, $stateParams,
        DecisionNotificationService, decisionBasicInfo, $rootScope, $scope, DecisionCriteriaCoefficientsConstant,
        $uibModal, decisionAnalysisInfo, $sce, Utils, DiscussionsNotificationService) {
        var vm = this,
            criteriaIds = [],
            _fo = DecisionSharedService.filterObject;


        // TODO: simplify conttoller and move to different componnts
        vm.$onInit = onInit;

        function onInit() {
            console.log('Decision Matrix Controller');

            vm.filterName = null;

            vm.id = $stateParams.id;
            vm.decision = decisionBasicInfo || {};
            $rootScope.pageTitle = vm.decision.name + ' Matrix | DecisionWanted';

            vm.decisionsSpinner = true;

            // First call
            // 1. Render criteria and decisions for fast delivery info for user
            vm.characteristicGroupsContentLoader = true;
            getCriteriaGroupsById(vm.id).then(function(criteriaResp) {
                getDecisionMatrix(vm.id).then(function(matrixResp) {
                    // Render html matrix
                    var decisionMatrixs = matrixResp.decisionMatrixs;
                    // 2. render list of criterias
                    // createMatrixContentCriteria(decisionMatrixs);
                    renderMatrix(false);

                    // Init only first time
                    initSorters(); //Hall of fame
                    initMatrixMode();

                    getCharacteristicsGroupsById(vm.id).then(function(resp) {
                        // 3. Render characteristics
                        prepareCharacteristicsGroups(resp);
                        createMatrixContentCharacteristics(decisionMatrixs);
                        renderMatrix(true);
                    });

                });
            });
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
            // if (_fo.decisionNameFilterPattern.length) {
            filterNameSend(null);
            // }
        }

        function filterNameSubmit(event, value) {
            // if (!value) return;
            if (event.keyCode === 13) {
                filterNameSend(value);
                event.preventDefault();
            }
        }

        function filterNameSend(value) {
            // if (!_.isNull(value) && !value) return;

            // TODO: send as parametr in getDecisionMatrix(id, filterObj) ?!
            _fo.decisionNameFilterPattern = _.escape(value);

            DecisionNotificationService.notifyFilterByName(_fo.decisionNameFilterPattern || value);
        }

        function filterNameSubmitClick(value) {
            // if (!value) return;
            // TODO: firs ng-touched
            filterNameSend(value);
        }
        // End Filter name

        //Subscribe to notification events
        DecisionNotificationService.subscribeSelectCriteria(function(event, data) {
            // TODO: simplify
            formDataForSearchRequest(data, data.coefCall);
            initSorters();
            getDecisionMatrix(vm.id).then(function(result) {
                initMatrix(result.decisionMatrixs, true);
            });
        });

        DecisionNotificationService.subscribePageChanged(function() {
            getDecisionMatrix(vm.id).then(function(result) {
                initMatrix(result.decisionMatrixs, true);
            });
        });

        DecisionNotificationService.subscribeChildDecisionExclusion(function() {
            getDecisionMatrix(vm.id).then(function(result) {
                initMatrix(result.decisionMatrixs, true);
            });
        });

        DecisionNotificationService.subscribeGetDetailedCharacteristics(function(event, data) {
            data.detailsSpinner = true;
            DecisionDataService.getDecisionCharacteristics(vm.id, data.id).then(function(result) {
                data.characteristics = prepareDataToDisplay(result);
            }).finally(function() {
                data.detailsSpinner = false;
            });
        });

        DecisionNotificationService.subscribeSelectSorter(function(event, data) {
            // TODO: clean up DecisionSharedService in controller maake one object
            DecisionSharedService.filterObject.sorters[data.mode] = data.sort;
            DecisionSharedService.filterObject.persistent = true;
            vm.fo = DecisionSharedService.filterObject.sorters;
            getDecisionMatrix(vm.id).then(function(result) {
                initMatrix(result.decisionMatrixs);
            });
        });

        DecisionNotificationService.subscribeSelectCharacteristic(function(event, data) {
            // if (!data.filterQueries) return;
            var sendFo = DecisionSharedService.filterObject;
            sendFo.persistent = true;
            //TODO: Clean up code
            if (!sendFo.filterQueries)
                sendFo.filterQueries = [];

            var find = _.findIndex(sendFo.filterQueries, function(filterQuery) {
                return filterQuery.characteristicId == data.filterQueries.characteristicId;
            });
            if (find >= 0) {
                // TODO: find better solution
                if (!_.isBoolean(data.filterQueries.value) && _.isEmpty(data.filterQueries.value) &&
                    _.isEmpty(data.filterQueries.queries)) {
                    sendFo.filterQueries.splice(find, 1);
                } else {
                    sendFo.filterQueries[find] = data.filterQueries;
                }
            } else {
                sendFo.filterQueries.push(data.filterQueries);
            }

            if (_.isEmpty(sendFo.filterQueries) ||
                (_.isArray(sendFo.filterQueries.value) && _.isEmpty(sendFo.filterQueries.value))) {
                sendFo.filterQueries = null;
            }

            getDecisionMatrix(vm.id).then(function(result) {
                initMatrix(result.decisionMatrixs, false);
            });
            // console.log(data);
            setCharacteristicChanges(data.filterQueries);
            DecisionNotificationService.notifyFilterTags(sendFo);
        });

        DecisionNotificationService.subscribeFilterByName(function(event, data) {
            getDecisionMatrix(vm.id).then(function(result) {
                initMatrix(result.decisionMatrixs, true);
                vm.filterName = data;
            });
        });


        // Discussions Subscrive
        vm.isCommentsOpen = false;
        DiscussionsNotificationService.subscribeOpenDiscussion(function(event, data) {
            vm.isCommentsOpen = true;
        });


        function setCharacteristicChanges(characteristic) {
            if (!characteristic) return;
            var characteristicCopy = angular.copy(characteristic);
            var value = characteristicCopy.value;
            if (characteristicCopy.queries && !characteristicCopy.value) {
                value = _.map(characteristicCopy.queries, function(query) {
                    return query.value;
                });
            }

            var characteristicGroups = _.forEach(vm.characteristicGroups, function(group) {
                var find = _.findIndex(group.characteristics, function(characteristicFind) {
                    return characteristicFind.id == characteristic.characteristicId;
                });
                if (find >= 0) {
                    group.characteristics[find].seletedValue = value;
                }
                return group;
            });

            vm.characteristicGroups = angular.copy(characteristicGroups);
            // debugger
            // console.log(vm.characteristicGroups);
        }


        function getCriteriaGroupsById(id) {
            return DecisionDataService.getCriteriaGroupsById(id).then(function(result) {
                criteriaIds = [];
                // Fill all criterias

                vm.criteriaGroups = _.map(result, function(criteriaItem) {
                    _.map(criteriaItem.criteria, function(criteria) {
                        if (criteria.description && !_.isObject(criteria.description)) {
                            criteria.description = $sce.trustAsHtml(criteria.description);
                        }
                        criteriaIds.push(criteria.id);
                        return criteria;
                    });
                    return criteriaItem;
                });

                if ($state.params.analysisId === 'hall-of-fame') {
                    _fo.selectedCriteria.sortCriteriaIds = criteriaIds;
                    _fo.persistent = false;
                }

                // TOOD: check if work correct
                return result;
            });
        }

        function getCharacteristicsGroupsById(id) {
            return DecisionDataService.getCharacteristicsGroupsById(id).then(function(result) {
                // characteristics
                return result;
            });
        }

        function prepareCharacteristicsGroups(result) {
            var total = 0;
            vm.characteristicGroups = _.chain(result).map(function(resultEl) {
                total += resultEl.characteristics.length;
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
                    return characteristicsItem;
                });
                return resultEl;
            }).value();
        }

        // TODO: try to optimize it
        // function createMatrixContentCriteria(decisions) {
        //     // Criteria
        //     var decisionsCopy = angular.copy(decisions);
        //     var criteriaGroupsCopy = angular.copy(vm.criteriaGroups);

        //     vm.criteriaGroupsContent = decisionsCopy;
        //     // vm.criteriaGroupsContent = _.map(criteriaGroupsCopy, function(criteriaItem) {
        //     //     criteriaItem.criteria = _.map(criteriaItem.criteria, function(criteria) {
        //     //         criteria.decisionsRow = createDecisionsRow(decisionsCopy, criteria.id, 'id', 'criteria');
        //     //         return _.omit(criteria, 'description');
        //     //     });
        //     //     return _.pick(criteriaItem, 'criteriaGroupId', 'criteria', 'isClosed');
        //     // });
        //     // console.log(vm.criteriaGroupsContent);
        //     // console.log(_.compact(vm.criteriaGroupsContent));
        // }

        // TODO: clean obj
        function createMatrixContentCharacteristics(decisions) {
            var decisionsCopy = angular.copy(decisions);
            // characteristics
            var characteristicGroupsCopy = angular.copy(vm.characteristicGroups);
            vm.characteristicGroupsContent = _.chain(characteristicGroupsCopy).map(function(resultEl) {
                resultEl.characteristics = _.map(resultEl.characteristics, function(characteristicsItem) {
                    characteristicsItem.decisionsRow = createDecisionsRow(decisions, characteristicsItem.id, 'id', 'characteristics');
                    return _.omit(characteristicsItem, 'description', 'createDate', 'name', 'sortable', 'options');
                });
                return _.pick(resultEl, 'id', 'characteristics', 'isClosed');
            }).value();
            // console.log(vm.characteristicGroupsContent);
        }

        function createDecisionsRow(array, id, keyId, property) {
            var arrayCopy = _.clone(array);
            return _.map(arrayCopy, function(item) {
                var obj = _.pick(item, 'decision');
                obj.decision = _.pick(item.decision, 'id', 'nameSlug');
                obj[property] = _.find(item[property], function(findEl) {
                    return findEl[keyId] === id;
                });
                obj[property] = _.omit(obj[property], 'description', 'options', 'filterable', 'sortable');
                obj.uuid = id.toString() + '-' + obj.decision.id.toString();
                return obj;
            });
        }
        // END TODO: try to optimize it

        //Init sorters, when directives loaded
        function initSorters() {
            // Set filter by name
            // if(_.isNull(_fo.sortDecisionPropertyName)) vm.filterName = null;
            _fo = DecisionSharedService.filterObject;
            _fo.pagination.totalDecisions = vm.decisions.totalDecisionMatrixs;
            vm.fo = _fo.sorters;
            // Set Criteria for Hall of fame
            var copyCriteria = angular.copy(vm.criteriaGroups);
            vm.criteriaGroups = _.filter(copyCriteria, function(criteriaGroupsArray) {
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
        }

        function findCoefNameByValue(valueSearch) {
            valueSearch = valueSearch;
            return _.find(DecisionCriteriaCoefficientsConstant.COEFFICIENT_LIST, function(record) {
                return record.value == valueSearch;
            });
        }

        // TODO: optimize avoid Reflow!
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

                // matrixAsideRowH.push(elAside.clientHeight);
                // matrixRowsH.push(el.clientHeight);

                newH = (elAside.clientHeight >= el.clientHeight) ? elAside.clientHeight : el.clientHeight;
                matrixSizes.push(newH);
                // Set new height
                // el.style.height = newH + 'px';
                // elAside.style.height = newH + 'px';
            }

            applySizes(matrixSizes);
        }

        function applySizes(matrixSizes) {
            var titleH = 24;
            // console.log(matrixSizes);

            var matrixSizesCopy = angular.copy(matrixSizes);
            var characteristicsCopy = angular.copy(vm.characteristicGroups);

            _.forEach(characteristicsCopy, function(group) {
                var array = matrixSizesCopy.splice(0, group.characteristics.length);
                var size = _.sum(array) + titleH;
                $('.matrix-g-characteristics[data-characteristic-group=' + group.id + ']').css({
                    'height': size
                });
                // console.log(size);
            });

            for (var i = 0; i < matrixSizes.length; i++) {
                matrixRows[i].style.height = matrixSizes[i] + 'px';
                matrixAsideRow[i].style.height = matrixSizes[i] + 'px';
            }
        }



        // TODO: drop settimeout and apply
        // Need only for first time load
        function renderMatrix(calcHeight) {
            setTimeout(function() {
                if (calcHeight !== false) calcMatrixRowHeight();
                reinitMatrixScroller();

                $scope.$applyAsync(function() {
                    vm.characteristicGroupsContentLoader = false;
                });
            }, 0);
            vm.decisionsSpinner = false;
        }

        function getDecisionMatrix(id, persistent) {
            vm.decisionsSpinner = true;
            var sendData = DecisionSharedService.getFilterObject();
            if(persistent === true) sendData.persistent = true;
            return DecisionDataService.getDecisionMatrix(id, sendData).then(function(result) {
                vm.decisions = result;
                vm.decisionMatrixList = prepareMatrixData(vm.decisions.decisionMatrixs);
                prevTotal = vm.decisionMatrixList.length;
                setMatrixTableWidth(vm.decisionMatrixList.length);
                return result;
            });
        }

        function initMatrix(data, calcHeight) {
            // var performance = window.performance;
            // var t0 = performance.now();
            // createMatrixContentCriteria(data);
            createMatrixContentCharacteristics(data);
            // var t1 = performance.now();
            // console.log("Call create matrix " + (t1 - t0) + " milliseconds.");
            initSorters();
            renderMatrix(calcHeight);

            initIncExcCounters();
        }

        function prepareMatrixData(data) {
            var dataCopy = angular.copy(data);
            return _.map(dataCopy, function(decisionMatrixEl) {
                if (!decisionMatrixEl.decision.imageUrl) decisionMatrixEl.decision.imageUrl = '/images/noimage.png';
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

        function orderByDecisionProperty(field, order) {
            if (!field) return;
            order = order || 'DESC';
            var sortObj = {
                sort: {
                    id: field,
                    order: order
                },
                mode: "sortByDecisionProperty"
            };
            $scope.$emit('selectSorter', sortObj);
        }

        function orderByCriteriaProperty(order, $event) {
            var sortObj;
            order = order || 'DESC';
            sortObj = {
                sort: {
                    order: order
                },
                mode: "sortByCriteria"
            };
            $scope.$emit('selectSorter', sortObj);
            var parentCriteria = $($event.target).parents('.criteria-col');
            if (parentCriteria.hasClass('selected')) {
                $event.stopPropagation();
            }
        }

        function orderByCharacteristicProperty(field, order) {
            if (!field) return;
            var sortObj;
            order = order || 'DESC';
            sortObj = {
                sort: {
                    id: field,
                    order: order
                },
                mode: "sortByCharacteristic"
            };
            $scope.$emit('selectSorter', sortObj);
        }

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
        initMatrixScroller();
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
                useTransition: true,
                bindToWrapper: true,
                disablePointer: true,
                disableTouch: false,
                // bounce: false,
                momentum: false,
                disableMouse: false
            });
        }

        function reinitMatrixScroller() {
            if (martrixScroll) {
                martrixScroll.refresh();
                martrixScroll.on('scroll', updatePosition);
                updatePosition(martrixScroll);
            }
        }

        var prevTotal;

        function setMatrixTableWidth(total) {
            // vm.tableWidth = total * 200 + 'px';
            var tableWidth = total * 200 + 'px';
            var table = document.getElementById('matrix-content');
            // if (vm.decisionMatrixList.length !== prevTotal)
            table.style.width = tableWidth;

        }

        function setMatrixTableHeight(total) {
            var tableH = total * 112 + 'px';
            $('#matrix-content').find('.characteristic-groups-content').css('min-height', tableH);
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
                    criteriaGroupId: result.criteriaGroupId
                });
                var criteriaIndex = _.findIndex(vm.criteriaGroups[groupIndex].criteria, {
                    id: result.id
                });
                vm.criteriaGroups[groupIndex].criteria[criteriaIndex] = result;
                selectCriteria(event, result, criteria.isSelected);
                vm.decisionsSpinner = false;
            });
        }
        var foSelectedCriteria = _fo.selectedCriteria;
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
            if(!type) type = 'criteria';
            $('[data-'+type+'-group="' + id + '"]').find('.js-toggle-hide').toggleClass('hide');

            // Incorect height calc
            setTimeout(function() {
                reinitMatrixScroller();
            }, 0);
        }
    }
})();