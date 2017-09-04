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
            vm.list = prepareMedia(vm.list);
            vm.activeMediaTab = 0;
            vm.media = [];
            pickMedia(vm.list);
        }

        function prepareMedia(list) {
            // TODO: make chain
            var cleanList = _.filter(list, function(item) {
                if (item.type !== 'LOGO' && item.type !== 'LINK') return item;
            });
            return _.chain(cleanList)
                .map(function(item) {
                    var obj = generateMediaHtml(item.type, item.url, item.name);
                    item = _.merge(item, obj);
                    item.name = item.name || item.type.toLowerCase();
                    return item;
                })
                .sortBy('order')
                .value();
        }

        function generateMediaHtml(type, url, name) {
            var html = '';
            var navItem = '';
            var src;
            var order = 9;
            switch (type) {
                case "IMAGE":
                    html = '<img src="' + url + '" class="media-' + type.toLowerCase() + ' img-responsive" alt="' + name + '">';
                    navItem = html;
                    type = 'image';
                    break;
                case "LINK":
                    html = '<a href="' + url + '" class="media-' + type.toLowerCase() + '" target="_blank">' + name + '</a>';
                    navItem = '<span class="media-ico bg-link">LINK <i class="fa fa-link" aria-hidden="true"></i></span>';
                    type = 'image';
                    break;
                case "VIMEOVIDEO":
                    html = '<iframe src="' + url + '" class="' + name + '" width="770" height="440"></iframe>';
                    navItem = '<span class="media-ico bg-play">PLAY <i class="fa fa-play" aria-hidden="true"></i></span>';
                    type = 'video';
                    order = 2;
                    break;
                case "YOUTUBEVIDEO":
                    html = '<iframe src="' + url + '" class="' + name + '" width="770" height="440"></iframe>';
                    navItem = '<span class="media-ico bg-play">PLAY <i class="fa fa-play" aria-hidden="true"></i></span>';
                    type = 'video';
                    order = 1;
                    break;
                case "WISTIAVIDEO":
                    html = '<iframe src="' + url + '" class="' + name + '" width="770" height="440"></iframe>';
                    navItem = '<span class="media-ico bg-play">PLAY <i class="fa fa-play" aria-hidden="true"></i></span>';
                    type = 'video';
                    order = 3;
                    break;
                    // case "LOGO":
                    //     html = '<img src="' + url + '" class="media-' + type.toLowerCase() + ' img-responsive"  alt="' + name + '">';
                    //     navItem = '<span class="media-ico bg-play">PLAY <i class="fa fa-play" aria-hidden="true"></i></span>';
                    //     break;

                default:
                    //
                    break;
            }
            // console.log(src);

            return {
                html: $sce.trustAsHtml(html),
                type: type,
                navHtml: $sce.trustAsHtml(navItem),
                order: order
            };
        }

        function pickMedia(mediaArray) {
            _.forEach(mediaArray, function(item) {
                var media = {
                    "url": item.url,
                    "thumb": item.url,
                    // "caption": item.name,
                    "type":  item.type
                };
                vm.media.push(media);
            });
            // console.log(vm.media);
        }
    }

})();