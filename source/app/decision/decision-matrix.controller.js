(function() {
    'use strict';
    angular.module('app.decision').controller('DecisionMatrixController', DecisionMatrixController);
    DecisionMatrixController.$inject = ['DecisionDataService', 'DecisionSharedService', '$state', '$stateParams',
        'DecisionNotificationService', 'decisionBasicInfo', '$rootScope', '$scope', '$q', 'DecisionCriteriaCoefficientsConstant',
        '$uibModal', 'decisionAnalysisInfo', '$sce', '$filter', '$compile', 'Utils', 'DiscussionsNotificationService'
    ];

    function DecisionMatrixController(DecisionDataService, DecisionSharedService, $state, $stateParams,
        DecisionNotificationService, decisionBasicInfo, $rootScope, $scope, $q, DecisionCriteriaCoefficientsConstant,
        $uibModal, decisionAnalysisInfo, $sce, $filter, $compile, Utils, DiscussionsNotificationService) {
        var vm = this,
            criteriaIds = [],
            _fo = DecisionSharedService.filterObject;


        vm.decisionId = $stateParams.id;
        vm.decision = decisionBasicInfo || {};
        $rootScope.pageTitle = vm.decision.name + ' Matrix | DecisionWanted';

        // TODO: simplify conttoller and move to different componnts
        init();

        // Digest
        // var nbDigest = 0;
        // console.log(nbDigest);
        // $rootScope.$watch(function() {
        //     nbDigest++;
        //     console.log(nbDigest);
        // });
        // End Digest

        function init() {
            // console.log('Decision Matrix Controller');
            vm.decisionsSpinner = true;

            // First call
            // 1. Render criteria and decisions for fast delivery info for user
            vm.characteristicGroupsContentLoader = true;
            $q.all([
                getDecisionMatrix(vm.decisionId),
                getCriteriaGroupsById(vm.decisionId)
            ]).then(function(values) {
                // Render html matrix

                var decisionMatrixs = values[0].decisionMatrixs;
                // 2. render list of criterias
                createMatrixContentCriteria(decisionMatrixs);
                renderMatrix(true);

                // Init only first time
                initSorters(); //Hall of fame
                initMatrixMode();

                getCharacteristictsGroupsById(vm.decisionId).then(function(resp) {
                    // 3. Render characteristicts
                    createMatrixContentCharacteristics(decisionMatrixs);
                    renderMatrix(true);
                    vm.characteristicGroupsContentLoader = false;
                });

            }, function(error) {
                console.log(error);
            });
        }

        //Subscribe to notification events
        DecisionNotificationService.subscribeSelectCriterion(function(event, data) {
            vm.decisionMatrixList = prepareMatrixData(data);
            initMatrix(data);
        });
        DecisionNotificationService.subscribePageChanged(function() {
            getDecisionMatrix(vm.decisionId).then(function(result) {
                initMatrix(result.decisionMatrixs);
            });
        });
        DecisionNotificationService.subscribeChildDecisionExclusion(function() {
            getDecisionMatrix(vm.decisionId).then(function(result) {
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
            // TODO: clean up DecisionSharedService in controller maake one object
            DecisionSharedService.filterObject.sorters[data.mode] = data.sort;
            DecisionSharedService.filterObject.persistent = true;
            vm.fo = DecisionSharedService.filterObject.sorters;
            getDecisionMatrix(vm.decisionId).then(function(result) {
                initMatrix(result.decisionMatrixs);
            });
        });
        DecisionNotificationService.subscribeSelectCharacteristic(function(event, data) {
            // if (!data.filterQueries) return;
            DecisionSharedService.filterObject.persistent = true;
            //TODO: Clean up code
            if (!DecisionSharedService.filterObject.filterQueries)
                DecisionSharedService.filterObject.filterQueries = [];

            var find = _.findIndex(DecisionSharedService.filterObject.filterQueries, function(filterQuery) {
                return filterQuery.characteristicId == data.filterQueries.characteristicId;
            });
            if (find >= 0) {
                // TODO: find better solution
                if (!_.isBoolean(data.filterQueries.value) && _.isEmpty(data.filterQueries.value) &&
                    !data.filterQueries.queries) {
                    DecisionSharedService.filterObject.filterQueries.splice(find, 1);
                } else {
                    DecisionSharedService.filterObject.filterQueries[find] = data.filterQueries;
                }
            } else {
                DecisionSharedService.filterObject.filterQueries.push(data.filterQueries);
            }
            if (_.isEmpty(DecisionSharedService.filterObject.filterQueries)) DecisionSharedService.filterObject.filterQueries = null;
            getDecisionMatrix(vm.decisionId).then(function(result) {
                initMatrix(result.decisionMatrixs, false);
            });
        });

        // Discussions Subscrive
        vm.isCommentsOpen = false;
        DiscussionsNotificationService.subscribeOpenDiscussion(function(event, data) {
            console.log(data);
            vm.isCommentsOpen = true;
        });


        function getCriteriaGroupsById(decisionId) {
            return DecisionDataService.getCriteriaGroupsById(decisionId).then(function(result) {
                criteriaIds = [];
                // Fill all criterias
                if ($state.params.analysisId === 'hall-of-fame') {
                    _fo.selectedCriteria.sortCriteriaIds = criteriaIds;
                    _fo.persistent = false;
                }

                vm.criteriaGroups = _.map(result, function(criteriaItem) {
                    _.map(criteriaItem.criteria, function(criteria) {
                        if (criteria.description && !_.isObject(criteria.description)) {
                            criteria.description = $sce.trustAsHtml(criteria.description);
                        }
                        criteriaIds.push(criteria.criterionId);
                        return criteria;
                    });
                    return criteriaItem;
                });

                // TOOD: check if work correct
                return result;
            });
        }

        function getCharacteristictsGroupsById(decisionId) {
            return DecisionDataService.getCharacteristictsGroupsById(decisionId).then(function(result) {
                // characteristics
                var total = 0;
                vm.characteristicGroups = _.map(result, function(resultEl) {
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
                });

                // setMatrixTableHeight(total);
                return result;
            });
        }

        // TODO: try to optimize it
        function createMatrixContentCriteria(decisions) {
            // Criteria
            var decisionsCopy = angular.copy(decisions);
            var criteriaGroupsCopy = angular.copy(vm.criteriaGroups);
            // console.log(decisionsCopy);
            // console.log(criteriaGroupsCopy);

            vm.criteriaGroupsContent = _.map(criteriaGroupsCopy, function(criteriaItem) {
                _.map(criteriaItem.criteria, function(criteria) {
                    criteria.decisionsRow = createDecisionsRow(decisionsCopy, criteria.criterionId, 'criterionId', 'criteria');
                    return _.omit(criteria, 'description');
                });
                return _.omit(criteriaItem, 'description', 'createDate', 'name');
            });
        }

        function createMatrixContentCharacteristics(decisions) {
            var decisionsCopy = angular.copy(decisions);
            // characteristics
            var characteristicGroupsCopy = angular.copy(vm.characteristicGroups);

            vm.characteristicGroupsContent = _.map(characteristicGroupsCopy, function(resultEl) {
                _.map(resultEl.characteristics, function(characteristicsItem) {
                    characteristicsItem.decisionsRow = createDecisionsRow(decisions, characteristicsItem.characteristicId, 'characteristicId', 'characteristics');
                    return _.omit(characteristicsItem, 'description', 'createDate', 'name', 'sortable', 'options');
                });
                return _.omit(resultEl, 'description', 'createDate', 'name');
            });
            // console.log(vm.characteristicGroupsContent);
        }

        function createDecisionsRow(array, id, keyId, property) {
            return _.map(array, function(item) {
                var obj = _.pick(item, 'decision');
                obj.decision = _.pick(item.decision, 'decisionId', 'nameSlug');
                obj[property] = _.find(item[property], function(findEl) {
                    return findEl[keyId] === id;
                });
                obj.uuid = parseInt(id.toString() + obj.decision.decisionId.toString());
                return obj;
            });
        }
        // END TODO: try to optimize it

        //Init sorters, when directives loaded
        function initSorters() {
            _fo.pagination.totalDecisions = vm.decisions.totalDecisionMatrixs;
            vm.fo = _fo.sorters;
            // Set Criteria for Hall of fame
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
            return _.find(DecisionCriteriaCoefficientsConstant.COEFFICIENT_LIST, function(record) {
                return record.value == valueSearch;
            });
        }

        // TODO: optimize avoid Reflow!
        var matrixAsideRow,
            matrixRows;
        matrixAsideRow = document.getElementsByClassName('js-item-aside');
        matrixRows = document.getElementsByClassName('js-matrix-item-content');

        function calcMatrixRowHeight() {
            $('.js-item-aside').css('height', '');
            $('.js-matrix-item-content').css('height', '');

            var asideArray = [],
                contentArray = [];
            for (var i = matrixRows.length - 1; i >= 0; i--) {
                var el,
                    elAside,
                    newH;

                el = matrixRows[i];
                elAside = matrixAsideRow[i];

                newH = (elAside.clientHeight >= el.clientHeight) ? elAside.clientHeight : el.clientHeight;
                // Set new height
                var newHpx = newH + 'px';
                el.style.height = newHpx;
                elAside.style.height = newHpx;

            }
        }

        // TODO: drop settimeout and apply
        // Need only for first time load
        function renderMatrix(calcHeight) {
            $(document).ready(function() {
                if (calcHeight !== false) calcMatrixRowHeight();
                reinitMatrixScroller();
                $scope.$applyAsync(function() {
                    vm.decisionsSpinner = false;
                    // $scope.$digest();
                });
            });
        }

        function getDecisionMatrix(id) {
            vm.decisionsSpinner = true;
            var sendData = DecisionSharedService.getFilterObject();
            return DecisionDataService.getDecisionMatrix(id, sendData).then(function(result) {
                vm.decisions = result;
                vm.decisionMatrixList = prepareMatrixData(vm.decisions.decisionMatrixs);
                setMatrixTableWidth(vm.decisionMatrixList.length);
                return result;
            });
        }

        function initMatrix(data, calcHeight) {
            // var performance = window.performance;
            // var t0 = performance.now();
            createMatrixContentCriteria(data);
            createMatrixContentCharacteristics(data);
            // var t1 = performance.now();
            // console.log("Call create matrix " + (t1 - t0) + " milliseconds.");
            initSorters(); //Hall of fame
            initMatrixMode();

            renderMatrix(calcHeight);
        }

        function prepareMatrixData(data) {
            return _.map(data, function(decisionMatrixEl) {
                if (!decisionMatrixEl.decision.imageUrl) decisionMatrixEl.decision.imageUrl = '/images/noimage.png';
                if (decisionMatrixEl.decision.description && !_.isObject(decisionMatrixEl.decision.description)) decisionMatrixEl.decision.description = $sce.trustAsHtml(decisionMatrixEl.decision.description);
                if (decisionMatrixEl.decision.criteriaCompliancePercentage >= 0) {
                    decisionMatrixEl.decision.criteriaCompliancePercentage = _.floor(decisionMatrixEl.decision.criteriaCompliancePercentage, 2);
                }
                return decisionMatrixEl;
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
            var _this = martrixScroll || this;
            scrollHandler(_this.y, _this.x);
            // TODO: avoid JQuery
            $('.matrix-g .app-control').toggleClass('selected', false);
            $('.app-pop-over-content').toggleClass('hide', true);
        }
        // Table scroll
        var tableBody,
            tableHeader,
            tableAside;
        tableAside = $('#matrix-aside-content');
        tableHeader = $('#matrix-scroll-group');

        function scrollHandler(scrollTop, scrollLeft) {
            $(tableAside).css({
                'top': scrollTop,
            });
            $(tableHeader).css({
                'left': scrollLeft
            });
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
            $('#matrix-content').css('width', tableWidth);
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

        function selectCriterion(event, criterion, coefCall) {
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
            DecisionDataService.getDecisionMatrix(vm.decisionId, sendData).then(function(result) {
                DecisionNotificationService.notifySelectCriterion(result.decisionMatrixs);
            });
        }


        function formDataForSearchRequest(criterion, coefCall) {
            if (!criterion.criterionId) return;
            var position = foSelectedCriteria.sortCriteriaIds.indexOf(criterion.criterionId);
            //select criterion
            if (position === -1) {
                foSelectedCriteria.sortCriteriaIds.push(criterion.criterionId);
                //don't add default coefficient
                if (criterion.coefficient && criterion.coefficient.value !== DecisionCriteriaCoefficientsConstant.COEFFICIENT_DEFAULT.value) {
                    foSelectedCriteria.sortCriteriaCoefficients[criterion.criterionId] = criterion.coefficient.value;
                }
                //add only coefficient (but not default)
            } else if (coefCall && criterion.coefficient.value !== DecisionCriteriaCoefficientsConstant.COEFFICIENT_DEFAULT.value) {
                foSelectedCriteria.sortCriteriaCoefficients[criterion.criterionId] = criterion.coefficient.value;
                //unselect criterion
            } else {
                foSelectedCriteria.sortCriteriaIds.splice(position, 1);
                delete foSelectedCriteria.sortCriteriaCoefficients[criterion.criterionId];
            }
            foSelectedCriteria.sortCriteriaIds = Utils.removeEmptyFromArray(foSelectedCriteria.sortCriteriaIds);
        }

        // Inclusion/Exclusion criteria
        vm.changeMatrixMode = changeMatrixMode;
        vm.updateExclusionList = updateExclusionList;

        function initMatrixMode() {
            vm.matrixMode = 'inclusion';
            vm.exclusionItemsLength = 0;
            if (_fo.includeChildDecisionIds && _fo.includeChildDecisionIds.length > 0) {
                vm.exclusionItemsLength = _fo.includeChildDecisionIds.length;
            } else if (_fo.excludeChildDecisionIds && _fo.excludeChildDecisionIds.length > 0) {
                vm.exclusionItemsLength = _fo.excludeChildDecisionIds.length;
            }
            vm.inclusionItemsLength = vm.decisions.totalDecisionMatrixs - vm.exclusionItemsLength;
        }

        function changeMatrixMode(mode) {
            var allowMode = ['inclusion', 'exclusion'];
            if (_.includes(allowMode, mode)) {
                vm.matrixMode = mode;
                if (mode === 'inclusion') {
                    _fo.excludeChildDecisionIds = _fo.includeChildDecisionIds;
                    vm.inclusionItemsLength = vm.decisions.totalDecisionMatrixs - _fo.excludeChildDecisionIds.length;
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
                Utils.addItemToArray(parseInt(id), _fo.excludeChildDecisionIds);
                vm.exclusionItemsLength = _fo.excludeChildDecisionIds.length;
            } else if (vm.matrixMode === 'exclusion') {
                Utils.removeItemFromArray(parseInt(id), _fo.includeChildDecisionIds);
                vm.exclusionItemsLength = _fo.includeChildDecisionIds.length;
            }
            vm.inclusionItemsLength = vm.decisions.totalDecisionMatrixs - vm.exclusionItemsLength;
            var send_fo = _fo;
            send_fo.persistent = true;
            DecisionNotificationService.notifyChildDecisionExclusion(send_fo);
        }

        // Toggle:
        vm.toggleGroupName = toggleGroupName;

        function toggleGroupName(id, type) {
            // console.log(id, type, vm.criteriaGroups[id]);
            // TODO: optimize
            var flag;
            if (type === 'criterion') {
                flag = vm.criteriaGroups[id].isClosed ? vm.criteriaGroups[id].isClosed : false;
                vm.criteriaGroups[id].isClosed = !flag;
                vm.criteriaGroupsContent[id].isClosed = !flag;
            } else if ('characteristics') {
                flag = vm.characteristicGroups[id].isClosed ? vm.characteristicGroups[id].isClosed : false;
                vm.characteristicGroups[id].isClosed = !flag;
                vm.characteristicGroupsContent[id].isClosed = !flag;
            }

            // Incorect height calc
            setTimeout(function() {
                reinitMatrixScroller();
            }, 0);
        }
    }
})();