(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ContentFormaterController', ContentFormaterController)
        .component('contentFormater', {
            // templateUrl: 'app/components/contentFormater/content-formater.html',
            bindings: {
                item: '<',
            },
            controller: 'ContentFormaterController',
            controllerAs: 'vm'
        });

    ContentFormaterController.$inject = ['$element', '$sce', '$compile', '$scope'];

    function ContentFormaterController($element, $sce, $compile, $scope) {
        var
            vm = this;

        // vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        // TODO: optmize it
        // All this staff for reduce count of angular wathcers

        function onInit() {
            vm.item = _.pick(vm.item, 'value', 'valueType');
            var renderContent = vm.item && vm.item.value ? typeFormater(vm.item) : '';
            $element.html(renderContent.value);
            if(renderContent.value) $compile($element.contents())($scope);
        }

        function onChanges() {
            onInit();
        }

        function typeFormaterArray(str) {
            if ((!str && !str.length) || _.isObject(str)) return;
            var html = '',
                array = JSON.stringify(str);
                array = JSON.parse(str);

            html += '<ul class="app-list-sm">';
            _.map(array, function(el) {
                html += '<li>' + el + '</li>';
            });
            html += '</ul>';
            return html;
        }


        function typeFormater(item) {
            if (!item || !item.valueType) return item;
            // CASE
            switch (item.valueType.toUpperCase()) {
                case "STRING":
                    item = stringFullDescr(item);
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
                default:
                    item.value = item.value || '';
            }

            return item;
        }

        function stringFullDescr(item) {
            if (item.value && item.value.length >= 40) {
                var itemCopy = _.clone(item);
                itemCopy.value = itemCopy.value.substring(0, 40);
                itemCopy.value += '...';
                itemCopy.value += '<span class="link-secondary" uib-popover="' + item.value + '" popover-placement="top" popover-append-to-body="true" popover-trigger="\'outsideClick\'" tabindex="0">read more</span>';
                itemCopy.compile = true;
                item = itemCopy;
            }
            return item;
        }
    }
})();