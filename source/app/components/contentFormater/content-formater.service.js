(function() {

    'use strict';

    angular
        .module('app.decision')
        .service('ContentFormaterService', ContentFormaterService);

    ContentFormaterService.$inject = ['Utils'];

    function ContentFormaterService(Utils) {

        function contentFormaterArray(str) {
            if (_.isObject(str) || !str) return;
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

        function getTemplate(value, type) {
            if (!value || !type) return;
            // console.log(value, type);
            // CASE Visual Mode
            var result = '';
            switch (type.toUpperCase()) {
                case "STRING":
                    result = stringFullDescr(value);
                    break;
                case "DATETIME":
                    result = Utils.dateToUI(value);
                    break;
                case "STRINGARRAY":
                    result = contentFormaterArray(value);
                    break;
                case "INTEGERARRAY":
                    result = contentFormaterArray(value);
                    break;
                case "BOOLEAN":
                    result = contentFormaterBool(value);
                    break;
                default:
                    result = value || '';
            }

            return result;
        }

        function stringFullDescr(val) {
            var html = '',
                valCopy = angular.copy(val);
            if (valCopy && valCopy.length >= 40) {
                valCopy = valCopy.substring(0, 40) + '...<span class="link-secondary" uib-popover="' + val + '" popover-placement="top" popover-append-to-body="true" popover-trigger="\'outsideClick\'" tabindex="0">read more</span>';
            }
            return valCopy;
        }

        function contentFormaterBool(val) {
            if(!val) return;
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

        return {
            getTemplate: getTemplate
        };
    }


})();