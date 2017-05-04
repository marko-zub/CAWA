(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('FilterTagsController', FilterTagsController)
        .component('filterTags', {
            template: renderTemplate,
            controller: 'FilterTagsController',
            controllerAs: 'vm'
        });

    renderTemplate.$inject = [];

    function renderTemplate() {
        return [
            '<div class="filter-tags">',
                '<div class="tag" ng-repeat="tag in vm.tags track by tag.uuid"></div>',
        	'</div>'
        ].join('\n');
    }

    FilterTagsController.$inject = ['DecisionSharedService', 'DecisionNotificationService'];

    function FilterTagsController(DecisionSharedService, DecisionNotificationService) {
        var vm = this;
        vm.fo = DecisionSharedService.getFilterObject();
        vm.removeTag = removeTag;

        vm.tags = [];
        init();

        function init() {

        }

        DecisionNotificationService.subscribeFilterTags(function(event, data) {
            createTagsList(data);
        });

	    function removeTag() {

	    }

        function createTagsList(data) {
            console.log(data.filterQueries)
            // vm.tags
        }
    }

})();