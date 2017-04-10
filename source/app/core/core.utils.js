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

		return {
			addItemToArray: addItemToArray,
			removeItemFromArray: removeItemFromArray
		};
	}
})();