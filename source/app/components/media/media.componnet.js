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
        }

        function prepareMedia(list) {
            // TODO: make chain
            var cleanList = _.filter(list, function(item) {
                if (item.type !== 'LOGO') return item;
            });
            return _.map(cleanList, function(item) {
                var obj = generateMediaHtml(item.type, item.url, item.name);
                item.html = obj.html;
                item.navHtml = obj.navHtml;
                item.name = item.name || item.type.toLowerCase();
                return item;
            });
        }

        function generateMediaHtml(type, url, name) {
            var html = '';
            var navItem = '';
            switch (type) {
                case "IMAGE":
                    html = '<img src="' + url + '" class="media-' + type.toLowerCase() + ' img-responsive" alt="' + name + '">';
                    navItem = html;
                    break;
                case "LINK":
                    html = '<a href="' + url + '" class="media-' + type.toLowerCase() + '" target="_blank">' + name + '</a>';
                    navItem = '<span class="media-ico bg-link">LINK <i class="fa fa-link" aria-hidden="true"></i></span>';
                    break;
                case "VIMEOVIDEO":
                    html = '<iframe src="' + url + '" class="' + name + '" width="875" height="480"></iframe>';
                    navItem = '<span class="media-ico bg-play">PLAY <i class="fa fa-play" aria-hidden="true"></i></span>';
                    break;
                case "YOUTUBEVIDEO":
                    html = '<iframe src="' + url + '" class="' + name + '" width="875" height="480"></iframe>';
                    navItem = '<span class="media-ico bg-play">PLAY <i class="fa fa-play" aria-hidden="true"></i></span>';
                    break;
                case "WISTIAVIDEO":
                    html = '<iframe src="' + url + '" class="' + name + '" width="875" height="480"></iframe>';
                    navItem = '<span class="media-ico bg-play">PLAY <i class="fa fa-play" aria-hidden="true"></i></span>';
                    break;
                // case "LOGO":
                //     html = '<img src="' + url + '" class="media-' + type.toLowerCase() + ' img-responsive"  alt="' + name + '">';
                //     navItem = '<span class="media-ico bg-play">PLAY <i class="fa fa-play" aria-hidden="true"></i></span>';
                //     break;

                default:
                    //
                    break;
            }

            return {
                html: $sce.trustAsHtml(html),
                navHtml: $sce.trustAsHtml(navItem)
            };
        }
    }

})();