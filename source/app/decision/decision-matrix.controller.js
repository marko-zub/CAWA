(function() {

    'user strict';

    angular
        .module('app.decision')
        .controller('DecisionMatrixController', DecisionMatrixController);

    DecisionMatrixController.$inject = ['DecisionDataService', 'DecisionSharedService', '$state',
        '$stateParams', 'DecisionNotificationService', 'decisionBasicInfo', '$rootScope', '$scope', '$q',
        'DecisionCriteriaConstant', '$uibModal', 'decisionAnalysisInfo', '$sce', '$filter', '$compile'
    ];

    function DecisionMatrixController(DecisionDataService, DecisionSharedService, $state,
        $stateParams, DecisionNotificationService, decisionBasicInfo, $rootScope, $scope, $q,
        DecisionCriteriaConstant, $uibModal, decisionAnalysisInfo, $sce, $filter, $compile) {
        var
            vm = this,
            isInitedSorters = false,
            defaultDecisionCount = 10,
            criteriaIds = [],
            _fo = DecisionSharedService.filterObject;

        vm.loadingComplete = false;
        vm.decisionId = $stateParams.id;
        vm.decision = decisionBasicInfo || {};
        $rootScope.pageTitle = vm.decision.name + ' Matrix | DecisionWanted';

        init();

        function init() {
            console.log('Decision Matrix Controller');

            // Get matrix data
            vm.decisionsSpinner = true;

            // TODO: render as separeted patrs
            $q.all([
                getCriteriaGroupsById(vm.decisionId),
                getCharacteristictsGroupsById(vm.decisionId)
            ]).then(function(values) {

                    // Fill all criterias
                    if ($state.params.analysisId === 'hall-of-fame') {
                        _fo.selectedCriteria.sortCriteriaIds = criteriaIds;
                        _fo.persistent = false;
                    }

                    // Render html matrix
                    searchDecisionMatrix(vm.decisionId).then(function(result) {
                        initMatrix(result.decisionMatrixs, values[0], values[1], result.totalDecisionMatrixs);
                        initMatrixScroller();
                    });

                },
                function(error) {
                    console.log(error);
                });


            //Subscribe to notification events
            DecisionNotificationService.subscribeSelectCriterion(function(event, data) {
                vm.decisionMatrixList = data;
                vm.decisionsSpinner = false;
                setDecisionMatchPercent(data);
                initMatrix(vm.decisionMatrixList);
            });

            DecisionNotificationService.subscribePageChanged(function() {
                searchDecisionMatrix(vm.decisionId).then(function(result) {
                    initMatrix(result.decisionMatrixs);
                });
            });

            DecisionNotificationService.subscribeChildDecisionExclusion(function() {
                searchDecisionMatrix(vm.decisionId).then(function(result) {
                    initMatrix(result.decisionMatrixs);
                });
            });

            DecisionNotificationService.subscribeGetDetailedCharacteristics(function(event, data) {
                data.detailsSpinner = true;
                DecisionDataService.getDecisionCharacteristics(vm.decisionId, data.decisionId).then(function(result) {
                    data.characteristics = prepareDataToDisplay(result);
                }).finally(function() {
                    data.detailsSpinner = false;
                });
            });

            DecisionNotificationService.subscribeSelectSorter(function(event, data) {
                DecisionSharedService.filterObject.sorters[data.mode] = data.sort;
                DecisionSharedService.filterObject.persistent = true;
                vm.fo = DecisionSharedService.filterObject.sorters;
                searchDecisionMatrix(vm.decisionId).then(function(result) {
                    initMatrix(result.decisionMatrixs);
                });
            });

        }

        function createCriteriaIds(array) {
            criteriaIds = [];
            _.map(array, function(resultEl) {
                _.map(resultEl.criteria, function(el) {
                    criteriaIds.push(el.criterionId);
                });
            });
        }


        function getCriteriaGroupsById(decisionId) {
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                createCriteriaIds(result);
                return result;
            });
        }


        function getCharacteristictsGroupsById(decisionId) {
            return DecisionDataService.getCharacteristictsGroupsById(decisionId);
        }

        // TODO: move to utils
        function isDate(date) {
            var isValueDate = (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
            return isValueDate;
        }

        // TODO: optimize
        // Criteia content for Matrix
        function findDecisonMatrixCriteriaById(criterionId) {
            return _.map(vm.decisionMatrixList, function(decisionMatrixEl) {
                var decisionCriteriaFind = _.pick(decisionMatrixEl, 'decision');
                decisionCriteriaFind = _.pick(decisionCriteriaFind, 'decisionId', 'nameSlug');
                // console.log(decisionCriteriaFind);
                _.findLast(decisionMatrixEl.criteria, function(decisionCriteria) {
                    if (decisionCriteria.criterionId === criterionId) {
                        decisionCriteriaFind.criteria = decisionCriteria;
                    }
                });
                return decisionCriteriaFind;
            });
        }

        function createMatrixContentCriteia(ctiteriaList) {
            // Ctiteria
            ctiteriaList = ctiteriaList || _.clone(vm.criteriaGroups); //TODO: optimize clean up
            vm.criteriaGroups = _.filter(ctiteriaList, function(ctiteriaListItem) {
                if (ctiteriaListItem.criteria.length > 0) {
                    _.map(ctiteriaListItem.criteria, function(ctiteriaListEl) {
                        ctiteriaListEl.description = $sce.trustAsHtml(ctiteriaListEl.description);

                        ctiteriaListEl.decisionsRow = findDecisonMatrixCriteriaById(ctiteriaListEl.criterionId);
                        return ctiteriaListEl;
                    });
                    return ctiteriaListItem;
                }
            });
        }

        // TODO: can be moved in loop with Criteia content for Matrix
        // Characteristicts content for Matrix
        function findDecisonMatrixCharacteristictsById(characteristicId) {
            return _.map(vm.decisionMatrixList, function(decisionMatrixEl) {
                var decisionCharacteristicFind = _.pick(decisionMatrixEl, 'decision');
                decisionCharacteristicFind = _.pick(decisionCharacteristicFind, 'decisionId', 'nameSlug');

                _.findLast(decisionMatrixEl.characteristics, function(decisionCharacteristic) {
                    if (decisionCharacteristic.characteristicId === characteristicId) {
                        decisionCharacteristicFind.characteristics = decisionCharacteristic;
                    }
                });
                return decisionCharacteristicFind;
            });
        }

        function createMatrixContentCharacteristicts(characteristicGroups) {
            characteristicGroups = characteristicGroups || _.clone(vm.characteristicGroups); //TODO: optimize clean up
            vm.characteristicGroups = _.filter(characteristicGroups, function(characteristictsListItem) {
                if (characteristictsListItem.characteristics.length > 0) {
                    characteristictsListItem.description = $sce.trustAsHtml(characteristictsListItem.description);
                    _.map(characteristictsListItem.characteristics, function(characteristictsListEl) {
                        characteristictsListEl.decisionsRow = findDecisonMatrixCharacteristictsById(characteristictsListEl.characteristicId);
                        return characteristictsListEl;
                    });
                    return characteristictsListItem;
                }
            });
        }

        // TODO: finlaize it & clean up
        function createMatrixContentOnce(decisions, criteriaGroups, characteristicGroups) {
            // console.log(decisions);
            var criteriaGroupsCopy = _.clone(criteriaGroups) || vm.criteriaGroups;
            var characteristicGroupsCopy = _.clone(characteristicGroups) || vm.characteristicGroups;

            // Fill criteria empty decisions
            _.map(criteriaGroupsCopy, function(resultEl) {
                _.map(resultEl.criteria, function(criteriaItem) {
                    criteriaItem.description = $sce.trustAsHtml(criteriaItem.description);
                    // criteriaItem.decisionsRow = Array(decisions.length || 10);
                    criteriaItem.decisionsRow = [];
                    // TODO: clean up
                    for (var i = 0; i < decisions.length; i++) {
                        criteriaItem.decisionsRow[i] = {
                            criteria: null
                        };
                    }
                });
            });

            // Fill characteristics empty decisions
            _.map(characteristicGroupsCopy, function(resultEl) {
                _.map(resultEl.characteristics, function(characteristicsItem) {
                    characteristicsItem.description = $sce.trustAsHtml(characteristicsItem.description);
                    characteristicsItem.decisionsRow = [];
                    // TODO: clean up
                    for (var i = 0; i < decisions.length; i++) {
                        characteristicsItem.decisionsRow[i] = {
                            characteristics: null
                        };
                    }
                });
            });


            _.map(decisions, function(item, itemIndex) {
                // console.log(decision.criteria);
                var decisionSend = _.pick(item.decision, 'decisionId', 'nameSlug');

                // criteria
                _.map(item.criteria, function(decisionCriteria) {
                    // console.log(decisionCriteria.criterionId);
                    findCriteriaIndexById(criteriaGroupsCopy, decisionCriteria, decisionSend, itemIndex);
                });

                // characteristics
                _.map(item.characteristics, function(characteristic) {
                    findCharacteristicsIndexById(characteristicGroupsCopy, characteristic, decisionSend, itemIndex);
                });
            });

            vm.criteriaGroups = criteriaGroupsCopy;
            vm.characteristicGroups = characteristicGroupsCopy;

            // console.log(characteristicGroupsCopy);
        }

        function findCriteriaIndexById(array, criteria, decision, decisionIndex) {
            _.map(array, function(resultEl) {
                _.map(resultEl.criteria, function(criteriaItem) {
                    if (criteriaItem.criterionId === criteria.criterionId) {
                        criteriaItem.decisionsRow[decisionIndex].criteria = criteria;
                    }
                });
            });
        }

        function findCharacteristicsIndexById(array, characteristics, decision, decisionIndex) {
            _.map(array, function(resultEl) {
                _.map(resultEl.characteristics, function(characteristicItem) {
                    if (characteristicItem.characteristicId === characteristics.characteristicId) {
                        characteristicItem.decisionsRow[decisionIndex].characteristics = characteristics;
                    }
                });
            });
        }



        // All content
        function createMatrixContent(criteriaGroups, characteristicGroups) {

            createMatrixContentCriteia(criteriaGroups);

            // TOOD: maybe use lazy load
            // Characteristic
            createMatrixContentCharacteristicts(characteristicGroups);
        }


        // TODO: try to optimize it can be removed
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                if (el.description) {
                    el.description = $sce.trustAsHtml(el.description);
                }
                return el;
            });
        }

        //Init sorters, when directives loaded
        function initSorters() {

            _fo.pagination.totalDecisions = vm.decisions.totalDecisionMatrixs;
            vm.fo = _fo.sorters;

            // Set Criteria
            _.map(vm.criteriaGroups, function(criteriaGroupsArray) {
                _.map(criteriaGroupsArray.criteria, function(el) {
                    if (_.includes(_fo.selectedCriteria.sortCriteriaIds, el.criterionId)) {
                        el.isSelected = true;
                        // Set criterion coefficient el.coefficient.
                        _.map(_fo.selectedCriteria.sortCriteriaCoefficients, function(value, key) {
                            if (el.isSelected && parseInt(key) === el.criterionId) {
                                var coefficientNew = findCoefNameByValue(value);
                                el.coefficient = coefficientNew;
                            }
                        });
                    }
                });
            });

        }

        function findCoefNameByValue(valueSearch) {
            valueSearch = valueSearch;
            return _.find(DecisionCriteriaConstant.COEFFICIENT_LIST, function(record) {
                return record.value == valueSearch;
            });
        }


        // TODO: optimize
        var matrixAside,
            matrixCols;

        matrixAside = document.getElementById('matrix-table-aside');
        matrixCols = document.getElementsByClassName('matrix-table-item-content');

        function calcMatrixRowHeight() {

            angular.element('.matrix-table-item').css('height', '');
            for (var i = 0; i < matrixCols.length; i++) {
                var el,
                    asideEl,
                    asideElH,
                    newH;

                el = matrixCols[i];

                asideEl = angular.element('#matrix-table-aside .matrix-table-item').eq(i);

                if (asideEl[0]) {
                    asideElH = asideEl[0].clientHeight;
                    newH = (asideElH > el.clientHeight) ? asideElH : el.clientHeight;

                    // Set new height

                    el.style.height = newH + 'px';
                    asideEl[0].style.height = newH + 'px';

                }
            }
        }

        // TODO: drop settimeout and apply
        // Need only for first time load
        function renderMatrix() {
            setTimeout(function() {
                calcMatrixRowHeight();
                reinitMatrixScroller();
                $scope.$applyAsync(function() {
                    vm.decisionsSpinner = false;
                });
            }, 0);
        }

        function searchDecisionMatrix(id) {
            vm.decisionsSpinner = true;

            var sendData = DecisionSharedService.getFilterObject();
            return DecisionDataService.searchDecisionMatrix(id, sendData).then(function(result) {
                vm.decisionMatrixList = result.decisionMatrixs;
                vm.decisions = result;
                return result;
            });
        }

        function initMatrix(data, criteriaGroups, characteristicGroups) {
            createMatrixContentOnce(data, criteriaGroups, characteristicGroups);
            // createMatrixContent(criteriaGroups, characteristicGroups);
            _.map(vm.decisionMatrixList, function(decisionMatrixEl) {
                decisionMatrixEl.decision.description = $sce.trustAsHtml(decisionMatrixEl.decision.description);
            });
            setMatrixTableWidth(data.length);
            renderMatrix();
            initSorters();
        }

        // TODO: make as in sorter directive
        vm.orderByDecisionProperty = orderByDecisionProperty;
        vm.orderByCharacteristicProperty = orderByCharacteristicProperty;
        vm.orderByCriteriaProperty = orderByCriteriaProperty;

        function orderByDecisionProperty(field, order) {
            if (!field) return;
            order = order || 'DESC';

            sortObj = {
                sort: {
                    id: field,
                    order: order
                },
                mode: "sortByDecisionProperty"
            };
            $scope.$emit('selectSorter', sortObj);
        }

        function orderByCriteriaProperty(order, $event) {
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
            var _this = martrixScroll || this;
            scrollHandler(_this.y, _this.x);

            // TODO: avoid JQuery
            $('.matrix-table-group .app-control').toggleClass('selected', false);
            $('.app-pop-over-content').toggleClass('hide', true);
        }


        // Table scroll
        var
            tableBody,
            tableHeader,
            tableAside;

        tableAside = $('#matrix-table-aside-content');
        tableHeader = $('#matrix-table-scroll-group');

        function scrollHandler(scrollTop, scrollLeft) {
            $(tableAside).css({
                'top': scrollTop,
            });
            $(tableHeader).css({
                'left': scrollLeft
            });
        }

        // Custom scroll
        var martrixScroll;

        function initMatrixScroller() {
            var wrapper = document.getElementById('matrix-table-body');
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
                disablePointer: true,
                disableTouch: false,
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

        function setMatrixTableWidth(total) {
            // vm.tableWidth = total * 200 + 'px';
            var tableWidth = total * 200 + 'px';
            $('#matrix-table-content').css('width', tableWidth);
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
                    criterionGroupId: result.criterionGroupId
                });
                var criteriaIndex = _.findIndex(vm.criteriaGroups[groupIndex].criteria, {
                    criterionId: result.criterionId
                });
                vm.criteriaGroups[groupIndex].criteria[criteriaIndex] = result;
                selectCriterion(event, result, criteria.isSelected);
                vm.decisionsSpinner = false;
            });
        }

        var foSelectedCriteria = _fo.selectedCriteria;
        vm.selectCriterion = selectCriterion;
        //Set decions percent(% criterion match)
        function setDecisionMatchPercent(list) {
            var percent;
            _.forEach(list, function(initItem) {
                percent = parseFloat(initItem.criteriaCompliancePercentage);
                if (_.isNaN(percent)) {
                    percent = 0;
                } else if (!_.isInteger(percent)) {
                    percent = percent.toFixed(2);
                }
                initItem.criteriaCompliancePercentage = percent + '%';
            });
        }

        function selectCriterion(event, criterion, coefCall) {

            // if($event.target ===)
            if ($(event.target).hasClass('title-descr')) return;

            vm.decisionsSpinner = true;
            if (coefCall && !criterion.isSelected) {
                return;
            }
            if (!coefCall) {
                criterion.isSelected = !criterion.isSelected;
            }
            formDataForSearchRequest(criterion, coefCall);

            var sendData = DecisionSharedService.getFilterObject();
            sendData.persistent = true;
            DecisionDataService.searchDecisionMatrix(vm.decisionId, sendData).then(function(result) {
                DecisionNotificationService.notifySelectCriterion(result.decisionMatrixs);
            });
        }

        // TODO: move to Utils
        function removeEmptyFromArray(array) {
            return _.filter(array, function(el) {
                if (el) return el; //can use just if(el); !_.isNull(el) && !_.isUndefined(el) && !_.isNaN(el)
            });
        }

        function formDataForSearchRequest(criterion, coefCall) {
            if (!criterion.criterionId) return;
            var position = foSelectedCriteria.sortCriteriaIds.indexOf(criterion.criterionId);
            //select criterion
            if (position === -1) {
                foSelectedCriteria.sortCriteriaIds.push(criterion.criterionId);
                //don't add default coefficient
                if (criterion.coefficient && criterion.coefficient.value !== DecisionCriteriaConstant.COEFFICIENT_DEFAULT.value) {
                    foSelectedCriteria.sortCriteriaCoefficients[criterion.criterionId] = criterion.coefficient.value;
                }
                //add only coefficient (but not default)
            } else if (coefCall && criterion.coefficient.value !== DecisionCriteriaConstant.COEFFICIENT_DEFAULT.value) {
                foSelectedCriteria.sortCriteriaCoefficients[criterion.criterionId] = criterion.coefficient.value;
                //unselect criterion
            } else {
                foSelectedCriteria.sortCriteriaIds.splice(position, 1);
                delete foSelectedCriteria.sortCriteriaCoefficients[criterion.criterionId];
            }
            foSelectedCriteria.sortCriteriaIds = removeEmptyFromArray(foSelectedCriteria.sortCriteriaIds);
        }

        // TODO: dontrepit yourself!!!
        // Characteristics
        controls = {
            CHECKBOX: '',
            SLIDER: '',
            SELECT: 'app/components/decisionCharacteristics/decision-characteristics-select-partial.html',
            RADIOGROUP: '',
            YEARPICKER: 'app/components/decisionCharacteristics/decision-characteristics-yearpicker-partial.html'
        };


        vm.getControl = getControl;
        vm.selectCharacteristic = selectCharacteristic;

        function getControl(characteristic) {
            return controls[characteristic.visualMode];
        }

        function selectCharacteristic(characteristic) {
            DecisionNotificationService.notifySelectCharacteristic(characteristic);
        }

        DecisionNotificationService.subscribeSelectCharacteristic(function(event, data) {
            console.log(data);
        });


        // Inclusion/Exclusion criteria
        vm.changeMatrixMode = changeMatrixMode;
        vm.updateExclusionList = updateExclusionList;

        initMatrixMode();

        function initMatrixMode() {
            vm.matrixMode = 'inclusion';
            vm.exclusionItemsLength = 0;
            if (_fo.includeChildDecisionIds && _fo.includeChildDecisionIds.length > 0) {
                vm.exclusionItemsLength = _fo.includeChildDecisionIds.length;
            } else if (_fo.excludeChildDecisionIds && _fo.excludeChildDecisionIds.length > 0) {
                vm.exclusionItemsLength = _fo.excludeChildDecisionIds.length;
            }
            vm.inclusionItemsLength = vm.decision.childDecisionIds.length - vm.exclusionItemsLength;
        }

        function changeMatrixMode(mode) {
            var allowMode = ['inclusion', 'exclusion'];
            if (_.includes(allowMode, mode)) {
                vm.matrixMode = mode;
                if (mode === 'inclusion') {
                    _fo.excludeChildDecisionIds = _fo.includeChildDecisionIds;
                    vm.inclusionItemsLength = vm.decision.childDecisionIds.length - _fo.excludeChildDecisionIds.length;
                    _fo.includeChildDecisionIds = null;
                    if (_fo.excludeChildDecisionIds.length === 0) {
                        _fo.excludeChildDecisionIds = null;
                    }
                } else if (mode === 'exclusion') {
                    _fo.includeChildDecisionIds = _fo.excludeChildDecisionIds;
                    vm.exclusionItemsLength = _fo.includeChildDecisionIds ? _fo.includeChildDecisionIds.length : 0;
                    _fo.excludeChildDecisionIds = null;
                    if (vm.exclusionItemsLength === 0) {
                        _fo.includeChildDecisionIds = [];
                    }
                }

                var send_fo = _fo;
                send_fo.persistent = false;
                DecisionNotificationService.notifyChildDecisionExclusion(send_fo);
            }
        }

        function updateExclusionList(id) {
            if (!id) return;

            if (vm.matrixMode === 'inclusion') {
                _fo.excludeChildDecisionIds = _fo.excludeChildDecisionIds ? _fo.excludeChildDecisionIds : [];
                addItemToArray(parseInt(id), _fo.excludeChildDecisionIds);
                vm.exclusionItemsLength = _fo.excludeChildDecisionIds.length;

            } else if (vm.matrixMode === 'exclusion') {
                removeItemFromArray(parseInt(id), _fo.includeChildDecisionIds);
                vm.exclusionItemsLength = _fo.includeChildDecisionIds.length;
            }
            vm.inclusionItemsLength = vm.decision.childDecisionIds.length - vm.exclusionItemsLength;

            var send_fo = _fo;
            send_fo.persistent = true;
            DecisionNotificationService.notifyChildDecisionExclusion(send_fo);
        }

        function addItemToArray(itemId, array) {
            if (!itemId || _.includes(array, itemId)) return;
            array.push(itemId);
        }

        function removeItemFromArray(itemId, array) {
            if (!itemId) return;

            var index = array.indexOf(itemId);
            if (array.indexOf(itemId) > -1) {
                array.splice(index, 1);
            }
        }


        // Discussions
        vm.isGetCommentsOpen = false;
        vm.getComments = getComments;

        function getComments() {
            vm.isGetCommentsOpen = true;
        }

    }
})();