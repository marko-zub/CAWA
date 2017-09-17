(function() {

    'use strict';

    angular.module('app.directives')
        .directive('appFotorama', ['$timeout', '$compile', function($timeout) {
            return {
                link: function(scope, element, attrs) {
                    scope.$watch(attrs.item, function(value) {
                        var val = angular.copy(value);
                        if (val) {

                            $timeout(function() {
                                var fotoramaKey = [];
                                angular.forEach(val, function(val, key) {
                                    var fotoObj = {};

                                    if (val.type === 'image') {
                                        fotoObj.img = val.url;
                                        fotoObj.thumb = val.url;
                                        fotoObj.caption = val.caption;
                                        fotoramaKey.push(fotoObj);
                                    } else { // it is  video
                                        fotoObj.thumb = val.thumb;
                                        fotoObj.caption = val.caption;
                                        fotoObj.video = val.url;
                                        fotoramaKey.push(fotoObj);
                                    }

                                });

                                if (!_.isEmpty(fotoramaKey)) {
                                    $(element).fotorama({
                                        data: fotoramaKey,
                                        nav: 'thumbs',
                                        thumbwidth: 120,
                                        thumbheight: 100
                                    });
                                }
                            }, 0, false);
                        }
                    }, true);
                }
            };
        }]);
})();