(function() {
    'use strict';

    angular
        .module('app.core')
        .service('Utils', Utils);

    function Utils() {

        function addItemToArray(itemId, array) {
            if (!itemId || _.includes(array, itemId)) return;
            array.push(itemId);
        }

        function removeItemFromArray(itemId, array) {
            if (!itemId) return;

            var index = array.indexOf(itemId);
            if (array.indexOf(itemId) > -1) {
                array.splice(index, 1);
            }
        }

        function removeEmptyFromArray(array) {
            return _.filter(array, function(el) {
                if (el) return el; //can use just if(el); !_.isNull(el) && !_.isUndefined(el) && !_.isNaN(el)
            });
        }

        // Dates
        function dateToDB(date) {
            var momentDate = Date(date);
            return moment(momentDate).valueOf();
        }

        function dateToUI(date) {
            if (!date) return;
            return moment(date).format('DD/MM/YYYY');
        }

        function dateYearToUI(date) {
            if (!date) return;
            return moment(date).format('YYYY');
        }

        function dateTimeToUI(date) {
            if (!date) return;
            return moment(date).format('DD/MM/YYYY HH:mm:ss');
        }

        // TODO: move to UTILS
        function findGroupItemById(id, list, property) {
            var findItem;
            _.forEach(list, function(group) {
                var find = _.find(group[property], function(groupItem) {
                    return groupItem.id === id;
                });
                if (find) findItem = find;
            });
            return findItem;

        }
        // function isDate(date) {
        //     var isValueDate = (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
        //     return isValueDate;
        // }

        function numberToUi(n, d) {
            var x = ('' + n).length;
            var p = Math.pow;
            d = p(10, d);
            x -= x % 3;
            return Math.round(n * d / p(10, x)) / d + ' kMGTPE' [x / 3];
        }

        return {
            addItemToArray: addItemToArray,
            removeItemFromArray: removeItemFromArray,
            removeEmptyFromArray: removeEmptyFromArray,
            dateToDB: dateToDB,
            dateToUI: dateToUI,
            dateYearToUI: dateYearToUI,
            dateTimeToUI: dateTimeToUI,
            findGroupItemById: findGroupItemById,
            numberToUi: numberToUi
        };
    }
})();