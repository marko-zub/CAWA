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
                '<div class="app-iscroll-wrapper" dw-scroll-bar>',
                '<ul class="app-list-sm">',
                content,
                '</ul>',
                '</div>'
            ].join('\n');
            return html;
        }

        function contentFormaterArrayWithDescription(array, descriptions, totalHistoryValues) {
            // console.log(str, descriptions);
            // if (_.isObject(str) || !str) return;
            // var array = JSON.stringify(str);
            // array = JSON.parse(str);
            // console.log(array);
            // console.log(totalHistoryValues);

            var content = _.map(array, function(el, index) {
                var result;
                // console.log(el);
                var description = descriptions[index] ? ' <small>' + descriptions[index] + '</small>': '';
                // if (totalHistoryValues) {
                //     var totalHistoryValueHtml = (totalHistoryValues[index] >= 0) ? '<a href="#" class="control readonly"><i class="fa fa-bar-chart" aria-hidden="true"></i> ' + totalHistoryValues[index] + '</a>' : '';
                //     result = '<li>' + el + description + ' ' + totalHistoryValueHtml + '</li>';
                // } else {
                     result = '<li>' + el + description  + '</li>';
                // }
                return result;
            }).join('\n');


            var html = [
                '<div class="app-iscroll-wrapper" dw-scroll-bar>',
                '<ul class="app-list-sm">',
                content,
                '</ul>',
                '</div>'
            ].join('\n');
            return html;
        }        

        function getTemplate(item) {
            var value, type, description, visualMode;

            value = item.value;
            type = item.valueType;
            description = item.description;
            visualMode = item.visualMode;

            // console.log(item);
            if (!value ) return;

            // TODO: fix return obj
            // CASE Visual Mode
            var compile = false;
            var result = '';

            if (item.multiValue === true) {
                // console.log(item);
                result = contentFormaterArrayWithDescription(value, item.description, item.totalHistoryValues);
                compile = true;
            } else {
                switch (type.toUpperCase()) {
                    case "STRING":
                        result = stringFullDescr(value).result;
                        compile = stringFullDescr(value).compile;
                        break;
                    case "DATETIME":
                        result = Utils.dateToUI(value);
                        break;
                    case "STRINGARRAY":
                        result = contentFormaterArray(value);
                        compile = true;
                        break;
                    case "INTEGERARRAY":
                        result = contentFormaterArray(value);
                        compile = true;
                        break;
                    case "BOOLEAN":
                        result = contentFormaterBool(value);
                        break;
                    case "LINK":
                        result = contentFormaterLink(value);
                        break;
                    default:
                        result = value || '';
                }
                if (description)
                    result += '<div class="description">' + description + '</div>';

                if (visualMode && visualMode.toUpperCase() === 'LINK')
                    result = contentFormaterLink(result);                
            }

            return {
                html: result,
                compile: compile
            };
        }

        function stringFullDescr(val) {
            var html, valCopy, compile = false;

            html = '';
            valCopy = angular.copy(val);
            if (valCopy && valCopy.length >= 40) {
                valCopy = valCopy.substring(0, 40) + '...<span class="link-secondary" uib-popover="' + val + '" popover-placement="top" popover-append-to-body="true" popover-trigger="\'outsideClick\'" tabindex="0">read more</span>';
                compile = true;
            }

            return {
                result: valCopy,
                compile: compile
            };
        }

        function contentFormaterLink(text) {
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            return text.replace(exp, "<a href='$1' class=\"link\" target=\"_blank\">$1</a>");
        }

        function contentFormaterBool(val) {
            if (!val) return;
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