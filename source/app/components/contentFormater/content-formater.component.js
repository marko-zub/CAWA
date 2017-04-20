(function() {

    'use strict';

    var projector = maquette.createProjector({});

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

    ContentFormaterController.$inject = ['$element', '$sce', '$compile', '$scope', '$filter'];

    function ContentFormaterController($element, $sce, $compile, $scope, $filter) {
        var
            vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = onChanges;

        // TODO: optmize it
        // All this staff for reduce count of angular wathcers
        var h = maquette.h;



        function onInit() {
            vm.item = _.pick(vm.item, 'value', 'valueType');
            var renderContent = vm.item && vm.item.value ? typeFormater(vm.item) : '';
            // console.log(renderContent.value);
            // var projector = maquette.createProjector({});
            // var renderMaquette = function() {
            //     return renderContent.value;
            // };


         //    var items = [{ name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }, { name: "a" }, { name: "b" }, { name: "c" }];
         //    var renderMaquette = function () {
         //      return h("div#container", items.map(
         //        function (item, index) {
         //          return h("input", { key: index, value: item.name });
         //        }
         //      ));
         //    };
            function render() {
                return h('div', renderContent.value);
            }
         //    projector.append($element, renderMaquette);

            // projector.append($element, renderMaquette);
            // $element.append(renderContent.value);


            $element.html( maquette.createProjector().merge($element[0], render));


            // if(render)
            $compile($element.contents())($scope);
        }

        function onChanges() {
            onInit();
        }

        function typeFormaterArray(str) {
            if (_.isObject(str) || (!str && !str.length)) return;
            var html = '',
                array = JSON.stringify(str); //TODO: avoid
            array = JSON.parse(str);

            var vdom = h("ul.app-list-sm",
                [_.map(array, function(el, index) {
                    return h('li', {key: index}, el);
                })]
            );
            // console.log(vdom);

            return vdom;
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
                    item.value = item.value || null;
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