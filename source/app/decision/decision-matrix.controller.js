(function() {

    'user strict';

    angular
        .module('app.decision')
        .controller('DecisionMatrixController', DecisionMatrixController);

    DecisionMatrixController.$inject = ['DecisionDataService', 'DecisionSharedService', '$state',
        '$stateParams', 'DecisionNotificationService', 'decisionBasicInfo', '$rootScope', '$scope', '$q',
        'DecisionCriteriaConstant', '$uibModal', 'decisionAnalysisInfo', '$sce', '$filter'
    ];

    function DecisionMatrixController(DecisionDataService, DecisionSharedService, $state,
        $stateParams, DecisionNotificationService, decisionBasicInfo, $rootScope, $scope, $q,
        DecisionCriteriaConstant, $uibModal, decisionAnalysisInfo, $sce, $filter) {
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

        function perpareCriteriaGroups(array) {
            criteriaIds = [];
            criteriaArray = [];
            return _.map(array, function(resultEl) {
                _.map(resultEl.criteria, function(el) {
                    el.description = $sce.trustAsHtml(el.description);
                    criteriaIds.push(el.criterionId);
                    criteriaArray.push(el);
                    return el;
                });

                return resultEl;
            });
        }

        function getCriteriaGroupsById(decisionId) {
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                vm.criteriaGroups = perpareCriteriaGroups(result);
                return vm.criteriaGroups;
            });;
        }


        function perpareCharacteristictsGroups(array) {
            characteristicsIds = [];
            characteristicsArray = [];
            return _.map(array, function(resultEl) {
                _.map(resultEl.characteristics, function(el) {
                    el.description = $sce.trustAsHtml(el.description);
                    characteristicsIds.push(el.characteristicId);
                    characteristicsArray.push(el);

                    return el;
                });
                return resultEl;
            });
        }

        function getCharacteristictsGroupsById(decisionId) {
            // Characteristicts
            return DecisionDataService.getCharacteristictsGroupsById(decisionId)
                .then(function(result) {
                    vm.characteristicGroups = perpareCharacteristictsGroups(result);
                    return vm.characteristicGroups;
                });
        }


        function init() {
            console.log('Decision Matrix Controller');

            // Get matrix data
            vm.decisionsSpinner = true;
            $q.all([
                    searchDecisionMatrix(vm.decisionId),
                    getCriteriaGroupsById(vm.decisionId),
                    getCharacteristictsGroupsById(vm.decisionId)
                ])
                .then(function(values) {
                    if ($state.params.analysisId === 'hall-of-fame') {
                        _fo.selectedCriteria.sortCriteriaIds = criteriaIds;
                        _fo.persistent = false;
                    }
                    initMatrix(values[0]);
                })


            //Subscribe to notification events
            DecisionNotificationService.subscribeSelectCriterion(function(event, data) {
                setDecisionMatchPercent(data);
                initMatrix(data);
            });

            DecisionNotificationService.subscribePageChanged(function() {
                searchDecisionMatrix(vm.decisionId).then(function(result) {
                    initMatrix(result);
                });
            });

            DecisionNotificationService.subscribeChildDecisionExclusion(function() {
                searchDecisionMatrix(vm.decisionId).then(function(result) {
                    initMatrix(result);
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
                    initMatrix(result);
                });
            });

        }


        // TODO: move to utils
        function isDate(date) {
            var isValueDate = (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
            return isValueDate;
        }

        // TODO: optimize
        // Criteia content for Matrix
        function findDecisonMatrixCriteriaById(decisionMatrixs, criterionId) {
            return _.map(decisionMatrixs, function(decisionMatrixEl) {
                var decisionCriteriaFind = {};
                decisionCriteriaFind.decision = decisionMatrixEl.decision;
                decisionCriteriaFind.criteria = null;

                _.find(decisionMatrixEl.criteria, function(decisionCriteria) {
                    if (decisionCriteria.criterionId === criterionId) {
                        decisionCriteriaFind.criteria = decisionCriteria;
                    }
                });
                return decisionCriteriaFind;
            });
        }

        function createMatrixContentCriteia(decisionMatrixs, ctiteriaList) {
            var decisionMatrixsClone = _.clone(decisionMatrixs);
            ctiteriaList = ctiteriaList ? ctiteriaList : vm.criteriaGroups;
            vm.criteriaListMatrix = _.map(ctiteriaList, function(ctiteriaList) {
                _.map(ctiteriaList.criteria, function(ctiteriaListEl) {
                    return ctiteriaListEl.decisionsRow = findDecisonMatrixCriteriaById(decisionMatrixsClone, ctiteriaListEl.criterionId);
                });
                return ctiteriaList;
            });
        }

        // TODO: can be moved in loop with Criteia content for Matrix
        // Characteristicts content for Matrix
        function findDecisonMatrixCharacteristictsById(decisionMatrixs, characteristicId) {
            return _.map(decisionMatrixs, function(decisionMatrixEl) {
                var decisionCharacteristicFind = {};
                decisionCharacteristicFind.decision = decisionMatrixEl.decision;
                decisionCharacteristicFind.characteristics = null;

                _.find(decisionMatrixEl.characteristics, function(decisionCharacteristic) {
                    descriptionTrustHtml(decisionMatrixEl.characteristics);
                    if (decisionCharacteristic.characteristicId === characteristicId) {
                        decisionCharacteristicFind.characteristics = typeFormater(decisionCharacteristic);
                    }
                });
                return typeFormater(decisionCharacteristicFind);
            });
        }

        function createMatrixContentCharacteristicts(decisionMatrixs, characteristictsList) {
            var decisionMatrixsClone = _.clone(decisionMatrixs);
            characteristictsList = characteristictsList ? characteristictsList : vm.characteristicGroups;
            vm.characteristictsListMatrix = _.map(characteristictsList, function(characteristictsList) {
                _.map(characteristictsList.characteristics, function(characteristictsListEl) {
                    return characteristictsListEl.decisionsRow = findDecisonMatrixCharacteristictsById(decisionMatrixsClone, characteristictsListEl.characteristicId);
                });
                return characteristictsList;
            });
        }


        // TODO: try to optimize it can be removed
        function descriptionTrustHtml(list) {
            return _.map(list, function(el) {
                el.description = $sce.trustAsHtml(el.description);
                return el;
            });
        }

        function typeFormater(item) {
            // CASE
            switch (item.valueType) {
                case "STRING":
                    stringFullDescr(item);
                    break;
                case "DATETIME":
                    item.value = $filter('date')(new Date(item.value), "dd/MM/yyyy");
                    break;
            }
            // debugger

            return item;
        }

        function stringFullDescr(item) {
            if (item.value && item.value.length >= 40) {
                item.descriptionFull = item.value;
                item.value = item.value.substring(0, 40);
                item.value += '...';
            }
            // debugger
            return item;
        }

        //Init sorters, when directives loaded
        function initSorters(total) {
            _fo.pagination.totalDecisions = total;
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
            })

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
            // for (var i = 0; i < matrixCols.length; i++) {
            //     var el,
            //         asideEl,
            //         asideElH,
            //         newH;

            //     el = matrixCols[i];
            //     asideEl = $('#matrix-table-aside .matrix-table-item').eq(i);
            //     asideElH = asideEl[0].clientHeight;
            //     newH = (asideElH > el.clientHeight) ? asideElH : el.clientHeight;

            //     // Set new height
            //     el.style.height = newH + 'px';
            //     asideEl[0].style.height = newH + 'px';

            // }
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
            return DecisionDataService.searchDecisionMatrix(id, sendData).then(function(result) {
                console.log(result.decisionMatrixs);
                vm.decisionMatrixList = descriptionTrustHtml(result.decisionMatrixs);
                return result;
            });
        }

        function initMatrix(data) {
            initSorters(data.totalDecisionMatrixs);
            createMatrixContentCriteia(data.decisionMatrixs);
            createMatrixContentCharacteristicts(data.decisionMatrixs);
            setMatrixTableWidth(data.decisionMatrixs);
            renderMatrix();
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

        function setMatrixTableWidth(array) {
            vm.tableWidth = array.length * 200 + 'px';
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

    }
})();