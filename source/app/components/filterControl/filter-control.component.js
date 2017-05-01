(function() {
    'use strict';
    angular.module('app.components').controller('FilterControlController', FilterControlController).component('filterControl', {
        // templateUrl: 'app/components/filterControl/filter-control.html',
        bindings: {
            item: '<',
        },
        controller: 'FilterControlController',
        controllerAs: 'vm'
    });

    FilterControlController.$inject = ['$element', '$compile', '$scope', 'DecisionNotificationService', 'Utils'];

    function FilterControlController($element, $compile, $scope, DecisionNotificationService, Utils) {
        var vm = this,
            controlOptions;
        // vm.$onChanges = onChanges;
        vm.$onInit = onInit;
        vm.$onDestroy = onDestroy;

        vm.callRangeSlider = callRangeSlider;
        vm.changeRadio = changeRadio;
        vm.changeSelect = changeSelect;

        vm.controlOptions = {
            debounce: 50
        };

        var selectAllObj = {
            characteristicId: null,
            characteristicOptionId: '*',
            createDate: null,
            description: null,
            name: 'All',
            value: 'null'
        };
        // TODO: global clean up and optimize

        function onInit() {
            // console.log(vm.item.valueType, vm.item.visualMode);
            // vm.item = _.pick(vm.item, 'valueType', 'visualMode', 'filterable', 'options', 'characteristicId', 'min', 'max');
            chooseValueType(vm.item);
        }


        // TODO: make nested switch ?!
        function chooseValueType(item) {
            if (!item || !item.valueType || !item.visualMode) return;
            item.valueType = item.valueType.toUpperCase();
            item.visualMode = item.visualMode.toUpperCase();

            switch (true) {
                case ((item.valueType === 'STRING') && (item.visualMode === 'SELECT')):
                    renderSelect(item);
                    break;
                case ((item.valueType === 'DATETIME') && (item.visualMode === 'DATERANGEPICKER')):
                    createDateRangePicker(item);
                    break;
                case ((item.valueType === 'INTEGER') && (item.visualMode === 'INTEGERRANGESLIDER')):
                    renderRangeSlider(item);
                    break;
                case ((item.valueType === 'STRINGARRAY') && (item.visualMode === 'LABEL')):
                    renderCheckboxes(item);
                    break;
                case ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'LABEL')):
                    renderCheckboxes(item);
                    break;
                case ((item.valueType === 'INTEGERARRAY') && (item.visualMode === 'SELECT')):
                    renderSelect(item);
                    break;
                case ((item.valueType === 'BOOLEAN') && (item.visualMode === 'RADIOGROUP')):
                    renderRadiogroup(item);
                    break;
                default:
                    //Empty
            }
        }

        function chooseVisualMode() {}


        // TODO: move to separete template
        function renderRangeSlider(item) {
            vm.slider = {
                min: Number(item.minValue),
                max: Number(item.maxValue),
                options: {
                    floor: Number(item.minValue),
                    ceil: Number(item.maxValue),
                    id: 'slider-' + item.characteristicId,
                    onEnd: vm.callRangeSlider
                }
            };

            var html = [
                '<div class="filter-item-wrapper">',
                '<rzslider rz-slider-model="vm.slider.min" rz-slider-high="vm.slider.max" rz-slider-model="vm.slider.value" rz-slider-options="vm.slider.options"></rzslider>',
                '<small>{{vm.slider.min}} - {{vm.slider.max}}</small>',
                '</div>'
            ].join('\n');
            renderHtml(html);
        }


        function callRangeSlider(sliderId, min, max, type) {
            // console.log('call range ', sliderId, vm.slider.value, vm.item.characteristicId, vm.slider);
            // TOOD: make some builder for queries
            var queries = [{
                "type": "GreaterOrEqualQuery",
                "characteristicId": vm.item.characteristicId,
                "value": min
            }, {
                "type": "LessOrEqualQuery",
                "characteristicId": vm.item.characteristicId,
                "value": max
            }];
            if (min == vm.item.minValue && max == vm.item.maxValue) {
                queries = null;
            }
            var query = {
                "type": "CompositeQuery",
                "characteristicId": vm.item.characteristicId,
                "operator": "AND",
                "queries": queries
            };

            //
            filterQueriesCharacteristicChange(vm.item.characteristicId, query);
        }

        function filterQueriesCharacteristicChange(characteristicId, query) {
            if (!characteristicId || !query) return;
            var filterQueries,
                findIndex,
                sendData;

            sendData = {
                'filterQueries': query
            };
            DecisionNotificationService.notifySelectCharacteristic(sendData);
        }


        // Contorl RADIOGROUP
        function renderRadiogroup(item) {

            var options = [{
                value: null,
                label: 'All'
            }, {
                value: true,
                label: 'Yes'
            }, {
                value: false,
                label: 'No'
            }];

            vm.radio = options[0].value;
            var content = _.map(options, function(option) {
                return [
                    '<label class="filter-list-item">',
                    '<input ng-model-options="vm.controlOptions" ng-change="vm.changeRadio(vm.radio)" name="radio ' + item.characteristicId + '" type="radio" ng-model="vm.radio" ng-value="' + option.value + '">' + option.label + '</label>',
                    '</label>'
                ].join('\n');
            }).join('\n');

            var html = [
                '<div class="filter-item-wrapper filter-list">',
                content,
                '</div>'
            ].join('\n');
            renderHtml(html);
        }

        function changeRadio(model) {
            var sendObj = {
                "type": "EqualQuery",
                "characteristicId": vm.item.characteristicId,
                "value": model
            };
            createFilterQuery(sendObj);
        }

        // Contorl SELECT
        function renderSelect(item) {
            vm.select = 'null';
            var options = _.sortBy(item.options, 'name');
            options.unshift(selectAllObj);
            var content = _.map(options, function(option) {
                option = '<option value="' + option.value + '">' + option.name + '</option>';
                return option;
            }).join('\n');

            var html = [
                '<div class="filter-item-wrapper">',
                '<select class="form-control input-sm" ng-model="vm.select" ng-model-options="vm.controlOptions" ng-change="vm.changeSelect(vm.select)">',
                content,
                '</select>',
                '</div>'
            ].join('\n');
            renderHtml(html);
        }

        function changeSelect(model) {
            if (model === 'null') model = null;
            var sendObj = {
                "type": "EqualQuery",
                "characteristicId": vm.item.characteristicId,
                "value": model,
            };
            createFilterQuery(sendObj);
        }


        // Control DATERANGEPICKER
        function createDateRangePicker(item) {
            vm.date = new Date();

            // vm.dateRangeOptions = {

            // }
            // console.log(item);
            var html = '<input date-range-picker class="form-control input-sm date-picker" type="text" ng-model="vm.date" min="\'2014-02-23\'" max="\'2015-02-25\'" />';
            renderHtml(html);
        }

        function renderHtml(html) {
            $element.html(html);
            $compile($element.contents())($scope);
        }

        function renderCheckboxes(item) {
            // String Array type
            var options = _.sortBy(item.options, 'name');

            var content = _.map(options, function(option) {
                var html = [
                    '<div class="filter-item-checkbox">',
                    '<input type="checkbox" id="option-' + option.characteristicOptionId + '" name="option-' + option.characteristicOptionId + '" value="' + option.value + '"> ',
                    '<label for="option-' + option.characteristicOptionId + '">' + option.name + '</label>',
                    '</div>'
                ];
                return html.join('\n');
            }).join('\n');

            var html = [
                '<div class="filter-item checkbox-list">',
                content,
                '</div>'
            ].join('\n');

            renderHtml(html);

            // Change value
            var checkedValues = [];
            $element.find('.filter-item-checkbox input').on('change', function() {
                var checkbox,
                    value;
                checkbox = $(this);
                value = checkbox.val();
                if (checkbox.is(':checked')) {
                    Utils.addItemToArray(value, checkedValues);
                } else {
                    Utils.removeItemFromArray(value, checkedValues);
                }
                var sendObj = {
                    'type': 'AllInQuery',
                    'characteristicId': item.characteristicId,
                    'value': checkedValues
                };
                createFilterQuery(sendObj);
            });
        }
        // TODO: move to Data Filter servise
        function createFilterQuery(data) {
            // Make constructor for Filter Query
            var sendVal = (data.value === false || data.value) ? data.value : null;
            var query = {
                'type': data.type || 'AllInQuery',
                'characteristicId': data.characteristicId || null,
                'value': sendVal
            };

            filterQueriesCharacteristicChange(data.characteristicId, query);
        }

        function onDestroy() {
            //onDestroy all js event
            $element.find('.filter-item-checkbox input').off('change');
        }
    }
})();