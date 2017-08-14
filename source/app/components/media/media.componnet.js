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
            prepareMedia(vm.list);
        }

        function prepareMedia(list) {
            _.map(list, function(item) {
                item.html = generateMediaHtml(item.type, item.url, item.name);
                item.name = item.name || item.type.toLowerCase();
                return item;
            });
        }

        function generateMediaHtml(type, url, name) {

            var html = '';
            switch (type) {
                case "IMAGE":
                    html = '<img src="' + url + '" class="media-' + type.toLowerCase() + ' img-responsive" alt="' + name + '">';
                    break;
                case "LINK":
                    html = '<a href="' + url + '" class="media-' + type.toLowerCase() + '" target="_blank">' + name + '</a>';
                    break;
                case "VIMEOVIDEO":
                    html = '<iframe src="' + url + '" class="' + name + '" width="875" height="500"></iframe>';
                    break;
                case "YOUTUBEVIDEO":
                    html = '<iframe src="' + url + '" class="' + name + '" width="875" height="500"></iframe>';
                    break;                    
                case "LOGO":
                    html = '<img src="' + url + '" class="media-' + type.toLowerCase() + ' img-responsive"  alt="' + name + '">';
                    break;

                default:
                    //
                    break;
            }

            return $sce.trustAsHtml(html);
        }
    }

})();