(function() {

	'use strict';

	angular
		.module('app.components')
		.directive('srcError', srcError);

	srcError.$inject = [];

	function srcError() {
		var directive = {
			restrict: 'A',
			link: link
		};

		return directive;

		function link(scope, element, attrs) {
			console.log(element[0]);
            element[0].onerror = function () {

                // element[0].className = element[0].className + " image-error";
                element[0].src = '/images/noimage.png';
            };
		}
	}

})();