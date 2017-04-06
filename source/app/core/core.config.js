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
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
            ['html', 'insertImage', 'insertLink', 'insertVideo']
        ];

        // ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'], ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'], ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'], ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        return taOptions;
    }
})();