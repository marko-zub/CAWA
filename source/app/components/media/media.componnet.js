(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('MediaController', MediaController)
        .component('media', {
            bindings: {
                list: '<'
            },
            templateUrl: 'app/components/media/media.html',
            controller: 'MediaController',
            controllerAs: 'vm'
        });


    MediaController.$inject = ['$sce'];

    function MediaController($sce) {
        var vm = this;
        vm.$onInit = onInit;

        function onInit() {
            // console.log(vm.list);
            vm.media = prepareMedia(vm.list);
            vm.activeMediaTab = 0;
        }

        function prepareMedia(list) {
            // TODO: make chain
            var mediaArray = [];
            var cleanList = _.filter(list, function(item) {
                if (item.type !== 'LOGO' && item.type !== 'LINK') return item;
            });
            _.chain(cleanList)
                .sortBy('order')
                .map(function(item) {
                    var obj = generateMediaHtml(item.type, item.url, item.name);
                    item = _.merge(item, obj);
                    var media = {
                        "url": item.url,
                        "thumb": item.url,
                        "caption": item.name || item.description,
                        "type": item.type
                    };

                    mediaArray.push(media);
                    return item;
                })
                .value();

            return mediaArray;
        }

        function generateMediaHtml(type, url, name) {
            var order = 9;
            switch (type) {
                case "IMAGE":
                    type = 'image';
                    break;
                case "LINK":
                    type = 'image';
                    break;
                case "VIMEOVIDEO":
                    type = 'video';
                    order = 2;
                    break;
                case "YOUTUBEVIDEO":
                    type = 'video';
                    order = 1;
                    break;
                case "WISTIAVIDEO":
                    type = 'video';
                    order = 3;
                    break;

                default:
                    //
                    break;
            }

            return {
                type: type,
                order: order
            };
        }
    }

})();