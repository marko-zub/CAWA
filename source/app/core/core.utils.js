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

        // function isDate(date) {
        //     var isValueDate = (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
        //     return isValueDate;
        // }

		return {
			addItemToArray: addItemToArray,
			removeItemFromArray: removeItemFromArray,
			removeEmptyFromArray: removeEmptyFromArray
		};
	}
})();