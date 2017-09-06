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
            vm.media = prepareMedia(vm.list);
            // console.log(vm.media);
            vm.activeMediaTab = 0;
        }

        function prepareMedia(list) {
            // TODO: make chain

            var cleanList = _.chain(list).filter(function(item) {
                if (item.type !== 'LOGO' && item.type !== 'LINK') {
                    var obj = generateMediaHtml(item.type, item.url, item.name);
                    return _.merge(item, obj);
                }
            }).sortBy('order').value();

            var mediaList = [];

            _.forEach(cleanList, function(item) {
                var caption = item.name || item.description;
                if (item.name && item.description) {
                    caption = item.name + ' - ' + item.description;
                }
                var media = {
                    'url': item.url,
                    'caption': caption,
                    'type': item.type
                };
                if (item.thumb) {
                    media.thumb = item.thumb;
                }
                mediaList.push(media);
            });
            return mediaList;

        }

        function getWistaVideo (url) {
            $.ajax({
                url: 'http://fast.wistia.net/oembed?url=http://home.wistia.com/medias/6am62oqhz7',
                success: function (resp) {
                    console.log(resp);
                    return resp.thumbnail_url;
                }
            });
        }

        function generateMediaHtml(type, url, name) {
            var order = 9;
            var thumb = '';
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
                    console.log(url);
                    thumb = 'http://embed.wistia.com/deliveries/5413caeac5fdf4064a2f9eab5c10a0848e42f19f.jpg?video_still_time=30';
                    //getWistaVideo(url); 
                    break;

                default:
                    //
                    break;
            }

            return {
                type: type,
                order: order,
                thumb: thumb
            };
        }
    }

})();