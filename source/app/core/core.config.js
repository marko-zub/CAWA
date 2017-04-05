(function() {

	'use strict';

	angular
		.module('app.core')
		.config(configuration);

	configuration.$inject = ['$animateProvider', '$provide'];

	function configuration($animateProvider, $provide) {
		// Enable ngAnimation for specific class
		$animateProvider.classNameFilter(/angular-animate/);

		$provide.decorator('taOptions', taOptions);
	}


	// textArea angular
	taOptions.$inject = ['taRegisterTool', '$delegate'];

	function taOptions(taRegisterTool, taOptions) {
		// $delegate is the taOptions we are decorating
		taOptions.toolbar = [
			['bold', 'italics', 'underline', 'redo', 'undo', 'clear']
		];
		return taOptions;
	}
})();