(function() {

    'user strict';

    angular
        .module('app.decision')
        .controller('DecisionMatrixController', DecisionMatrixController);

    DecisionMatrixController.$inject = ['DecisionDataService', 'DecisionSharedService', '$stateParams', 'DecisionNotificationService', 'decisionBasicInfo', '$rootScope', '$compile', '$scope', '$q', 'DecisionCriteriaConstant', '$uibModal', 'decisionAnalysisInfo'];

    function DecisionMatrixController(DecisionDataService, DecisionSharedService, $stateParams, DecisionNotificationService, decisionBasicInfo, $rootScope, $compile, $scope, $q, DecisionCriteriaConstant, $uibModal, decisionAnalysisInfo) {
        var
            vm = this,
            isInitedSorters = false,
            defaultDecisionCount = 10;

        var criteriaIds = [];
        var characteristicsIds = [];

        vm.decisionId = $stateParams.id;
        vm.decision = decisionBasicInfo || {};
        $rootScope.pageTitle = vm.decision.name + ' Matrix | DecisionWanted';

        init();

        function getCriteriaGroupsById() {
            // Criteria
            return DecisionDataService.getCriteriaGroupsById(vm.decisionId).then(function(result) {
                vm.criteriaGroups = result;
                criteriaIds = _.map(result["0"].criteria, function(el) {
                    return el.criterionId;
                });
            });
        }

        function getCharacteristictsGroupsById() {
            // Characteristicts
            return DecisionDataService.getCharacteristictsGroupsById(vm.decisionId).then(function(result) {
                vm.characteristicGroups = result;

                characteristicsIds = _.map(result["0"].characteristics, function(el) {
                    return el.characteristicId;
                });
            });
        }


        function init() {
            console.log('Decision Matrix Controller');

            // TODO: merge to one array with titles

            //Get data for decision panel (main)
            vm.decisionsSpinner = true;


            // Get criteria and characteristic
            $q.all([getCriteriaGroupsById(), getCharacteristictsGroupsById()])
                .then(function(values) {

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
                vm.decisionsSpinner = true;
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
                vm.decisionsSpinner = true;
                DecisionSharedService.filterObject.sorters[data.mode] = data.sort;
                vm.sorterData = DecisionSharedService.filterObject.sorters;
                searchDecisionMatrix(vm.decisionId);
            });

        }


        // TODO: move to utils
        function isDate(date) {
            var isValueDate = (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
            return isValueDate;
        }

        // Fill matrix data for View
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
                var newEL = _.clone(el);
                newEL.criteria = [];
                newEL.characteristics = [];

                // Fill empty criteria
                newEL.criteria = _.map(criteriaIds, function(criterionId) {
                    var emptyCriterianDataNew = _.clone(emptyCriterianData);
                    emptyCriterianDataNew.criterionId = criterionId;
                    _.map(el.criteria, function(elCriterionIdObj) {
                        if (elCriterionIdObj.criterionId === criterionId) {
                            emptyCriterianDataNew = elCriterionIdObj;
                        }
                    });

                    return emptyCriterianDataNew;
                });

                // Fill empty characteristics
                newEL.characteristics = _.map(characteristicsIds, function(characteristicId) {
                    var emptyCharacteristicDataNew = _.clone(emptyCharacteristicData);
                    emptyCharacteristicDataNew.characteristicId = characteristicId;
                    _.map(el.characteristics, function(elCharacteristicObj) {
                        if (elCharacteristicObj.characteristicId === characteristicId) {
                            emptyCharacteristicDataNew = elCharacteristicObj;
                        }
                    });

                    return emptyCharacteristicDataNew;
                });

                return newEL;
            });


            return matrixContent;
        }

        //Init sorters, when directives loaded
        function initSorters() {
            // if (!isInitedSorters) {
            //     DecisionNotificationService.notifyInitSorter({
            //         list: [{
            //             name: 'Weight',
            //             order: 'DESC',
            //             isSelected: true
            //         }],
            //         type: 'sortByCriteria',
            //         mode: 'twoStep'
            //     });
            //     DecisionNotificationService.notifyInitSorter({
            //         list: [{
            //             name: 'Create Date',
            //             propertyId: 'createDate'
            //         }, {
            //             name: 'Update Date',
            //             propertyId: 'updateDate'
            //         }, {
            //             name: 'Name',
            //             propertyId: 'name'
            //         }],
            //         type: 'sortByDecisionProperty',
            //         mode: 'threeStep'
            //     });
            //     isInitedSorters = true;
            // }

            vm.sorterData = DecisionSharedService.filterObject.sorters;

            // Set Criteria
            _.map(vm.criteriaGroups[0].criteria, function(el) {
                if (_.includes(DecisionSharedService.filterObject.selectedCriteria.sortCriteriaIds, el.criterionId)) {
                    el.isSelected = true;
                }
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
                asideElH = parseInt(asideEl.outerHeight());
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
            DecisionDataService.searchDecisionMatrix(id, DecisionSharedService.getFilterObject()).then(function(result) {
                var resultdecisionMatrixs = result.decisionMatrixs;
                initSorters();

                DecisionSharedService.filterObject.pagination.totalDecisions = result.totalDecisionMatrixs;

                vm.decisionMatrixList = createMatrixContent(criteriaIds, characteristicsIds, resultdecisionMatrixs);

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
                selectCriterion(result, true);
                vm.decisionsSpinner = false;
            });
        }

        var _fo = DecisionSharedService.filterObject.selectedCriteria;
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

        function selectCriterion(criterion, coefCall) {
            vm.decisionsSpinner = true;
            if (coefCall && !criterion.isSelected) {
                return;
            }
            if (!coefCall) {
                criterion.isSelected = !criterion.isSelected;
            }
            formDataForSearchRequest(criterion, coefCall);

            DecisionDataService.searchDecisionMatrix(vm.decisionId, DecisionSharedService.getFilterObject()).then(function(result) {
                DecisionNotificationService.notifySelectCriterion(result.decisionMatrixs);
            });
        }

        function formDataForSearchRequest(criterion, coefCall) {
            var position = _fo.sortCriteriaIds.indexOf(criterion.criterionId);
            //select criterion
            if (position === -1) {
                _fo.sortCriteriaIds.push(criterion.criterionId);
                //don't add default coefficient
                if (criterion.coefficient && criterion.coefficient.value !== DecisionCriteriaConstant.coefficientDefault.value) {
                    _fo.sortCriteriaCoefficients[criterion.criterionId] = criterion.coefficient.value;
                }
                //add only coefficient (but not default)
            } else if (coefCall && criterion.coefficient.value !== DecisionCriteriaConstant.coefficientDefault.value) {
                _fo.sortCriteriaCoefficients[criterion.criterionId] = criterion.coefficient.value;
                //unselect criterion
            } else {
                _fo.sortCriteriaIds.splice(position, 1);
                delete _fo.sortCriteriaCoefficients[criterion.criterionId];
            }
        }

        // Analysis
        console.log(decisionAnalysisInfo);
        // vm.sorterData = initAnalysis(decisionAnalysisInfo);
        if (decisionAnalysisInfo) initAnalysis(decisionAnalysisInfo);

        function initAnalysis(data) {
            var filterObjectEmpty = {
                selectedCriteria: {
                    sortCriteriaIds: [],
                    sortCriteriaCoefficients: {}
                },
                pagination: {
                    pageNumber: 1,
                    pageSize: 10,
                    totalDecisions: 0
                },
                selectedCharacteristics: {},
                sorters: {
                    sortByCriteria: {
                        order: 'DESC'
                    },
                    sortByCharacteristic: {
                        id: null,
                        order: null
                    },
                    sortByDecisionProperty: {
                        id: null,
                        order: null
                    }
                },
                selectedDecision: {
                    decisionsIds: []
                }
            };

            // Set new values
            var sortObj = filterObjectEmpty;
            sortObj.selectedCriteria.sortCriteriaCoefficients = data.sortCriteriaCoefficients;
            sortObj.selectedCriteria.sortCriteriaIds = data.sortCriteriaIds;
            sortObj.sorters.sortByCriteria.order = data.sortWeightCriteriaDirection;

            sortObj.sorters.sortByCharacteristic.order = data.sortCharacteristicDirection;

            sortObj.pagination.pageSize = data.pageSize;
            // console.log(sortObj);
            // return sortObj;
            DecisionSharedService.setFilterObject(sortObj);
            // DecisionSharedService.getFilterObject(sortObj);
            _fo = DecisionSharedService.filterObject.selectedCriteria;

            return _fo;
        }

    }
})();