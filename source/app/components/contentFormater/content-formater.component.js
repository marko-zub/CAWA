(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('ContentFormaterController', ContentFormaterController)
        .component('contentFormater', {
            bindings: {
                item: '<',
                characteristic: '<',
            },
            controller: 'ContentFormaterController',
            controllerAs: 'vm'
        });

    ContentFormaterController.$inject = ['ContentFormaterService', '$element', '$compile', '$scope'];

    function ContentFormaterController(ContentFormaterService, $element, $compile, $scope) {
        var vm = this;

        vm.$onChanges = onChanges;

        function onChanges(changes) {
            if (changes.item &&
                !angular.equals(changes.item.currentValue, changes.previousValue)) {
                var characteristic = _.omit(vm.characteristic, 'description');
                var item = _.merge(changes.item.currentValue, characteristic);
                var renderContent = ContentFormaterService.getTemplate(item);
                renderHtml(renderContent);
            }
        }

        function renderHtml(data) {
            if (_.isEmpty(data)) return;
            $element.html(data.html);
            if (data.compile) $compile($element.contents())($scope);
        }

    }
})();