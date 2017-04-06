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
                searchDecisionMatrix(vm.decisionId),
                getCriteriaGroupsById(vm.decisionId),
                getCharacteristictsGroupsById(vm.decisionId)
            ]).then(function(values) {

                    initMatrixScroller();
                    // Fill all criterias
                    if ($state.params.analysisId === 'hall-of-fame') {
                        _fo.selectedCriteria.sortCriteriaIds = criteriaIds;
                        _fo.persistent = false;
                    }

                    // Render html matrix
                    initMatrix(values[0].decisionMatrixs);
                },
                function(error) {
                    console.log(error);
                });


            //Subscribe to notification events
            DecisionNotificationService.subscribeSelectCriterion(function(event, data) {
                vm.decisionMatrixList = data;
                vm.decisionsSpinner = false;
                // console.log(vm.decisionMatrixList)
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

        function prepareCriteriaGroups(array) {
            criteriaIds = [];
            return _.map(array, function(resultEl) {
                if (resultEl.criteria.length > 0) { //Hide empty group
                    _.map(resultEl.criteria, function(el) {
                        el.description = $sce.trustAsHtml(el.description);
                        criteriaIds.push(el.criterionId);
                        return el;
                    });

                    return resultEl;
                }
            });
        }

        function getCriteriaGroupsById(decisionId) {
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                vm.criteriaGroups = prepareCriteriaGroups(result);
                return result;
            });
        }


        function perpareCharacteristictsGroups(array) {
            return _.filter(array, function(resultEl) {
                if (resultEl.characteristics.length > 0) { //Hide empty group
                    _.map(resultEl.characteristics, function(el) {
                        el.description = $sce.trustAsHtml(el.description);
                        return el;
                    });
                    return resultEl;
                }
            });
        }

        function getCharacteristictsGroupsById(decisionId) {
            // Characteristicts
            return DecisionDataService.getCharacteristictsGroupsById(decisionId)
                .then(function(result) {
                    vm.characteristicGroups = perpareCharacteristictsGroups(result);
                    return result;
                });
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

                _.findLast(decisionMatrixEl.criteria, function(decisionCriteria) {
                    if (decisionCriteria.criterionId === criterionId) {
                        decisionCriteriaFind.criteria = decisionCriteria;
                    }
                });
                return decisionCriteriaFind;
            });
        }

        function createMatrixContentCriteia(decisionMatrixs, ctiteriaList) {
            // Ctiteria
            ctiteriaList = vm.criteriaGroups;
            vm.criteriaListMatrix = _.filter(ctiteriaList, function(ctiteriaListItem) {
                _.map(ctiteriaListItem.criteria, function(ctiteriaListEl) {
                    ctiteriaListEl.decisionsRow = findDecisonMatrixCriteriaById(ctiteriaListEl.criterionId);
                    return ctiteriaListEl;
                });
                return ctiteriaListItem;
            });
        }

        // TODO: can be moved in loop with Criteia content for Matrix
        // Characteristicts content for Matrix
        function findDecisonMatrixCharacteristictsById(characteristicId) {
            return _.map(vm.decisionMatrixList, function(decisionMatrixEl) {
                var decisionCharacteristicFind = _.pick(decisionMatrixEl, 'decision');

                _.findLast(decisionMatrixEl.characteristics, function(decisionCharacteristic) {
                    descriptionTrustHtml(decisionMatrixEl.characteristics);
                    if (decisionCharacteristic.characteristicId === characteristicId) {
                        decisionCharacteristicFind.characteristics = typeFormater(decisionCharacteristic);
                    }
                });
                return typeFormater(decisionCharacteristicFind);
            });
        }

        function createMatrixContentCharacteristicts() {
            // Characteristic
            characteristictsList = vm.characteristicGroups;
            vm.characteristictsListMatrix = _.map(characteristictsList, function(characteristictsListItem) {
                _.map(characteristictsListItem.characteristics, function(characteristictsListEl) {
                    characteristictsListEl.decisionsRow = findDecisonMatrixCharacteristictsById(characteristictsListEl.characteristicId);
                    return characteristictsListEl;
                });
                return characteristictsListItem;
            });
        }

        // All content
        function createMatrixContent() {
            // var vm.decisionMatrixList = _.clone(decisionMatrixs);
            // Ctiteria
            createMatrixContentCriteia();

            // Characteristic
            createMatrixContentCharacteristicts();
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

        // TODO: move to another component
        function typeFormaterArray(str) {
            if (_.isObject(str)) return str;
            var html = '',
                array = JSON.parse(str);

            html += '<ul class="app-list-sm">';
            _.map(array, function(el) {
                html += '<li>' + el + '</li>';
            });
            html += '</ul>';
            return $sce.trustAsHtml(html);
        }


        function typeFormater(item) {
            if (!item || !item.valueType) return item;
            // CASE
            switch (item.valueType.toUpperCase()) {
                case "STRING":
                    stringFullDescr(item);
                    break;
                case "DATETIME":
                    item.value = $filter('date')(new Date(item.value), "dd/MM/yyyy");
                    break;
                case "STRINGARRAY":
                    item.value = typeFormaterArray(item.value);
                    break;
                case "INTEGERARRAY":
                    item.value = typeFormaterArray(item.value);
                    break;
            }

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

            for (var i = 0; i < matrixCols.length; i++) {
                var el,
                    asideEl,
                    asideElH,
                    newH;

                el = matrixCols[i];

                asideEl = $('#matrix-table-aside .matrix-table-item').eq(i);

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
                initSorters(result.totalDecisionMatrixs);
                return result;
            });
        }

        function initMatrix(data) {
            createMatrixContent();
            _.map(vm.decisionMatrixList, function(decisionMatrixEl) {
                decisionMatrixEl.decision.description = $sce.trustAsHtml(decisionMatrixEl.decision.description);
            });
            setMatrixTableWidth(data.length);
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
            vm.tableWidth = total * 200 + 'px';
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