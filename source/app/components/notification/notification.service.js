(function() {

    'use strict';

    angular
        .module('app.components')
        .factory('MsgService', MsgService);

    MsgService.$inject = ['$injector'];

    function MsgService($injector) {
        var toastr = $injector.get('toastr');   

        var success = function(title, message) {
            toastr.success(title, message);
        };

        var error = function(title, message) {
            toastr.error(title, message);
        };

        return {
            success: success,
            error: error
        };
    }
})();