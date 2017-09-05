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

        function contentFormaterPrice(value) {
            var n = Number(value);
            return n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        }

        function contentFormaterDate(value, mode) {
            var result = '';
            switch (mode.toUpperCase()) {
                case "YEARPICKER":
                    result = Utils.dateYearToUI(value);
                    break;
                default:
                    result = Utils.dateToUI(value);
            }
            return result;
        }

        function stringBr(str) {
            return str.replace(/(&#13;)?&#10;/g, '<br/>');
        }

        function contentFormaterArrayWithDescription(array, descriptions, totalHistoryValues) {
            // console.log(str, descriptions);
            // if (_.isObject(str) || !str) return;
            // var array = JSON.stringify(str);
            // array = JSON.parse(str);
            // console.log(array);
            // TODO: use reg exp
            if (typeof array === 'string') {
                array = array.replace(/\[/g, "").replace(/\]/g, "");
                array = array.split(',');
            }
            // console.log(totalHistoryValues);

            var content = _.map(array, function(el, index) {
                var result;
                // console.log(el);
                var description = descriptions && descriptions[index] ? ' <div class="additional-description">' + stringBr(descriptions[index]) + '</div>' : '';
                // if (totalHistoryValues) {
                //     var totalHistoryValueHtml = (totalHistoryValues[index] >= 0) ? '<a href="#" class="control readonly"><i class="fa fa-bar-chart" aria-hidden="true"></i> ' + totalHistoryValues[index] + '</a>' : '';
                //     result = '<li>' + el + description + ' ' + totalHistoryValueHtml + '</li>';
                // } else {
                result = '<li>' + el + description + '</li>';
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

            if (!value) return;

            // TODO: fix return obj
            // CASE Visual Mode
            var compile = false;
            var result = '';

            // console.log(type);
            // console.log(item, visualMode, type);
            if (item.multiValue === true) {
                result = contentFormaterArrayWithDescription(value, item.description, item.totalHistoryValues);
                compile = true;
            } else {
                // console.log(type.toUpperCase(), visualMode);
                switch (type.toUpperCase()) {
                    case "STRING":
                        result = stringFullDescr(value).result;
                        compile = stringFullDescr(value).compile;
                        break;
                    case "DATETIME":
                        result = contentFormaterDate(value, visualMode);
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
                    case "PRICE":
                        result = contentFormaterPrice(value);
                        break;
                    default:
                        result = value || '';
                }
                if (description)
                    result += '<div class="description">' + description + '</div>';

                if (visualMode && visualMode.toUpperCase() === 'LINK') {
                    result = contentFormaterLink(result);
                }
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
            //URLs starting with http://, https://, or ftp://
            var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            var replacedText = text.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

            //URLs starting with www. (without // before it, or it'd re-link the ones done above)
            var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

            //Change email addresses to mailto:: links
            // var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
            // var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

            return replacedText;
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