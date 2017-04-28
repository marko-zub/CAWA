(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ContentFormaterController', ContentFormaterController)
        .component('contentFormater', {
            template: renderTemplate,
            bindings: {
                item: '<',
            },
            controller: 'ContentFormaterController',
            controllerAs: 'vm'
        });


    renderTemplate.$inject = [];

    function renderTemplate() {
        return '<div ng-bind-html="::vm.html"></div>';
    }

    ContentFormaterController.$inject = ['$filter'];

    function ContentFormaterController($filter) {
        var
            vm = this;

        vm.$onInit = onInit;

        function onInit() {
            // console.log('init');
            vm.item = _.pick(vm.item, 'value', 'valueType');
            var renderContent = vm.item && vm.item.value ? typeFormater(vm.item) : '';
            if (renderContent) {
                vm.html = renderContent;
                // $element.html(renderContent);
                // $compile($element.contents())($scope);
            }
        }

        function typeFormaterArray(str) {
            if (_.isObject(str) || (!str && !str.length)) return;
            var array = JSON.stringify(str);
            array = JSON.parse(str);

            var content = _.map(array, function(el) {
                return '<li>' + el + '</li>';
            }).join('\n');


            var html = [
                '<ul class="app-list-sm">',
                content,
                '</ul>'
            ].join('\n');
            return html;
        }


        function typeFormater(item) {
            if (!item || !item.valueType) return item;
            var itemCopy = angular.copy(item);
            // CASE
            // console.log(item.valueType);
            var result = '';
            switch (itemCopy.valueType.toUpperCase()) {
                case "STRING":
                    result = stringFullDescr(itemCopy.value);
                    break;
                case "DATETIME":
                    result = $filter('date')(new Date(itemCopy.value), "dd/MM/yyyy");
                    break;
                case "STRINGARRAY":
                    result = typeFormaterArray(itemCopy.value);
                    break;
                case "INTEGERARRAY":
                    result = typeFormaterArray(itemCopy.value);
                    break;
                case "BOOLEAN":
                    result = typeFormaterBool(itemCopy.value);
                    break;
                default:
                    result = itemCopy.value || '';
            }

            return result;
        }

        function stringFullDescr(val) {
            var html = '',
                valCopy = angular.copy(val);
            if (valCopy.length >= 40) {
                valCopy = valCopy.substring(0, 40) + '...<span class="link-secondary" uib-popover="' + val + '" popover-placement="top" popover-append-to-body="true" popover-trigger="\'outsideClick\'" tabindex="0">read more</span>';
            }
            return valCopy;
        }

        function typeFormaterBool(val) {
            var html = '';
            val = val.toLowerCase();
            // Switch ?!
            if (val == 'yes' || val == 'true') {
                html = '<i class="fa fa-check color-green" aria-hidden="true"></i>';
            } else if (val == 'no' || val == 'false') {
                html = '<i class="fa fa-times color-light-red" aria-hidden="true"></i>';
            }

            return html;
        }

    }
})();