(function() {

    'user strict';

    angular
        .module('app.decision')
        .controller('DecisionMatrixController', DecisionMatrixController);

    DecisionMatrixController.$inject = ['DecisionDataService', 'DecisionSharedService', '$state', '$stateParams', 'DecisionNotificationService', 'decisionBasicInfo', '$rootScope', '$scope', '$q', 'DecisionCriteriaConstant', '$uibModal', 'decisionAnalysisInfo', '$sce'];

    function DecisionMatrixController(DecisionDataService, DecisionSharedService, $state, $stateParams, DecisionNotificationService, decisionBasicInfo, $rootScope, $scope, $q, DecisionCriteriaConstant, $uibModal, decisionAnalysisInfo, $sce) {
        var
            vm = this,
            isInitedSorters = false,
            defaultDecisionCount = 10,
            criteriaIds = [],
            characteristicsIds = [],
            criteriaArray = [],
            characteristicsArray = [];

        vm.decisionId = $stateParams.id;
        vm.decision = decisionBasicInfo || {};
        $rootScope.pageTitle = vm.decision.name + ' Matrix | DecisionWanted';

        init();

        var _fo = DecisionSharedService.filterObject;

        function getCriteriaGroupsById(decisionId) {
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                // vm.criteriaGroups = result;
                criteriaIds = [];
                vm.criteriaGroups = _.map(result, function(resultEl) {
                    _.map(resultEl.criteria, function(el) {
                        el.description = $sce.trustAsHtml(el.description);
                        criteriaIds.push(el.criterionId);
                        criteriaArray.push(el);
                        return el;
                    });

                    return resultEl;
                });
            });
        }

        function getCharacteristictsGroupsById(decisionId) {
            // Characteristicts
            return DecisionDataService.getCharacteristictsGroupsById(decisionId).then(function(result) {
                // vm.characteristicGroups = result;
                characteristicsIds = [];

                vm.characteristicGroups =_.map(result, function(resultEl) {
                    _.map(resultEl.characteristics, function(el) {
                        el.description = $sce.trustAsHtml(el.description);
                        characteristicsIds.push(el.characteristicId);
                        characteristicsArray.push(el);

                        return el;
                    });
                    return resultEl;
                });
            });
        }


        function init() {
            console.log('Decision Matrix Controller');


            vm.decisionsSpinner = true;

            // Get criteria and characteristic
            $q.all([getCriteriaGroupsById(vm.decisionId), getCharacteristictsGroupsById(vm.decisionId)])
                .then(function(values) {

                    // Analysis Hall of Fame
                    if ($state.params.analysisId === 'hall-of-fame') {
                        console.log('hall-of-fame');
                        // _fo.selectedCriteria.sortCriteriaIds = criteriaIds;
                        // _fo.persistent = false;
                    }

                    setMatrixTableWidth();
                    searchDecisionMatrix(vm.decisionId);
                });


            //Subscribe to notification events
            DecisionNotificationService.subscribeSelectCriterion(function(event, data) {
                setDecisionMatchPercent(data);
                var resultdecisionMatrixs = data;
                vm.decisionMatrixList = createMatrixContent(criteriaIds, characteristicsIds, resultdecisionMatrixs);
                renderMatrix();
            });

            DecisionNotificationService.subscribePageChanged(function() {
                searchDecisionMatrix(vm.decisionId);
            });

            DecisionNotificationService.subscribeChildDecisionExclusion(function() {
                searchDecisionMatrix(vm.decisionId);
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
                _fo.sorters[data.mode] = data.sort;
                vm.fo = _fo.sorters;
                DecisionSharedService.filterObject.persistent = true;
                searchDecisionMatrix(vm.decisionId);
            });

        }


        // TODO: move to utils
        function isDate(date) {
            var isValueDate = (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
            return isValueDate;
        }

        var emptyCriterianData = {
            // "criterionId": null,
            "weight": null,
            "totalVotes": null
        };

        var emptyCharacteristicData = {
            // "characteristicId": null,
            "valueType": null,
            "visualMode": null,
            "sortable": false,
            "filterable": false,
            "value": null,
            "options": []
        };


        // TODO: try to optimize it
        function createMatrixContent(criteriaIds, characteristicsIds, decisionMatrixList) {

            var matrixContent = [];
            var i = 0;
            matrixContent = _.map(decisionMatrixList, function(el) {
                // New element with empty characteristics and criteria
                var newEl = _.clone(el);
                newEl.criteria = [];
                newEl.characteristics = [];
                // newEl.description = null;

                newEl.decision.description = $sce.trustAsHtml(newEl.decision.description);

                // Fill empty criteria
                newEl.criteria = _.map(criteriaArray, function(criterionArrayEl) {
                    // console.log(criterionArrayEl);

                    var criterionArrayElClone = _.clone(criterionArrayEl);
                    // criterionArrayElClone.description = $sce.trustAsHtml(criterionArrayElClone.description);
                    // console.log(criterionArrayEl);

                    _.map(el.criteria, function(elCriterionIdObj) {
                        // console.log(elCriterionIdObj);
                        if (elCriterionIdObj.criterionId === criterionArrayElClone.criterionId) {

                            // TODO: merge
                            criterionArrayElClone.criterionId = elCriterionIdObj.criterionId;
                            criterionArrayElClone.likeSum = elCriterionIdObj.likeSum;
                            criterionArrayElClone.totalDislikes = elCriterionIdObj.totalDislikes;
                            criterionArrayElClone.totalLikes = elCriterionIdObj.totalLikes;
                            criterionArrayElClone.totalVotes = elCriterionIdObj.totalVotes;
                            criterionArrayElClone.weight = elCriterionIdObj.weight;
                            // console.log(elCriterionIdObj);
                        }
                    });

                    return criterionArrayElClone;
                });

                // Fill empty characteristics
                newEl.characteristics = _.map(characteristicsIds, function(characteristicId) {
                    var emptyCharacteristicDataNew = _.clone(emptyCharacteristicData);
                    emptyCharacteristicDataNew.characteristicId = characteristicId;
                    if (emptyCharacteristicDataNew.description) emptyCharacteristicDataNew.description = $sce.trustAsHtml(emptyCharacteristicDataNew.description);
                    _.map(el.characteristics, function(elCharacteristicObj) {
                        if (elCharacteristicObj.characteristicId === characteristicId) {
                            emptyCharacteristicDataNew = elCharacteristicObj;
                        }
                    });

                    return emptyCharacteristicDataNew;
                });

                return newEl;
            });


            return matrixContent;
        }

        //Init sorters, when directives loaded
        function initSorters(total) {
            _fo.pagination.totalDecisions = total;
            vm.fo = _fo.sorters;

            // Set Criteria
            _.map(vm.criteriaGroups[0].criteria, function(el) {

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
        }

        function findCoefNameByValue(valueSearch) {
            valueSearch = valueSearch;
            return _.find(DecisionCriteriaConstant.COEFFICIENT_LIST, function(record) {
                return record.value == valueSearch;
            });
        }

        function calcMatrixRowHeight() {
            // TODO: optimize
            var matrixAside,
                matrixCols;

            matrixAside = document.getElementById('matrix-table-aside');
            matrixCols = document.getElementsByClassName('matrix-table-item-content');
            for (var i = 0; i < matrixCols.length; i++) {
                var el,
                    asideEl,
                    asideElH,
                    newH;

                el = matrixCols[i];
                asideEl = $('#matrix-table-aside .matrix-table-item').eq(i);
                asideElH = asideEl.outerHeight();
                newH = (asideElH > el.clientHeight) ? asideElH : el.clientHeight;

                // Set new height
                el.style.height = newH + 'px';
                asideEl.get(0).style.height = newH + 'px';

            }
        }

        // TODO: drop settimeout and apply
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
            DecisionDataService.searchDecisionMatrix(id, sendData).then(function(result) {
                initSorters(result.totalDecisionMatrixs);
                vm.decisionMatrixList = createMatrixContent(criteriaIds, characteristicsIds, result.decisionMatrixs);

                renderMatrix();
            });
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
        var wrapper = document.getElementById('matrix-table-body');
        var martrixScroll = new IScroll(wrapper, {
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

        function reinitMatrixScroller() {
            if (martrixScroll) {
                martrixScroll.refresh();
                martrixScroll.on('scroll', updatePosition);
                updatePosition(martrixScroll);
            }
        }

        function setMatrixTableWidth() {
            var criteriaGroupsCount,
                characteristicGroupsCount;

            // TODO: include groups
            criteriaGroupsCount = vm.criteriaGroups[0].criteria.length || 0;
            characteristicGroupsCount = vm.characteristicGroups[0].characteristics.length || 0;
            vm.tableWidth = (criteriaGroupsCount + characteristicGroupsCount) * 120 + 60 + 'px';
        }

        // TODO: make as a separeted component
        // Criteria header
        vm.editCriteriaCoefficient = editCriteriaCoefficient;

        function editCriteriaCoefficient(event, criteria) {
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
                selectCriterion(result, criteria.isSelected);
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
            if($(event.target).hasClass('title-descr')) return;

            vm.decisionsSpinner = true;
            if (coefCall && !criterion.isSelected) {
                return;
            }
            if (!coefCall) {
                criterion.isSelected = !criterion.isSelected;
            }
            formDataForSearchRequest(criterion, coefCall);

            DecisionSharedService.filterObject.persistent = true;
            DecisionDataService.searchDecisionMatrix(vm.decisionId, DecisionSharedService.filterObject).then(function(result) {
                DecisionNotificationService.notifySelectCriterion(result.decisionMatrixs);
            });
        }

        function formDataForSearchRequest(criterion, coefCall) {
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


        // TODO: make as simple link <a ui-sref>
        vm.goToDiscussion = goToDiscussion;

        function goToDiscussion(decision, critOrCharId, criteria_item) {
            var params = {
                'discussionId': decision.decisionId,
                'discussionSlug': decision.nameSlug,
                'critOrCharId': critOrCharId
            };
            $state.go('decisions.single.matrix.child.option', params);
        }


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

            } else if(vm.matrixMode === 'exclusion') {
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

    }
})();