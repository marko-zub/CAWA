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
        '<div class="tag-group" ng-repeat="tag in vm.tags track by tag.characteristicId">',
        '<span>{{tag.characteristicName}}:</span>',
        '<div class="tag" ng-repeat="tagVal in tag.data track by $index">',
        '{{tagVal}} <span ng-click="vm.removeTag(tag, tagVal)" class="icon-remove"><i class="fa fa-times" aria-hidden="true"></i></span>',
        '</div>',
        '</div>',
        '</div>'
      ].join('\n');
    }

    FilterTagsController.$inject = ['DecisionSharedService', 'DecisionNotificationService', 'Utils'];

    function FilterTagsController(DecisionSharedService, DecisionNotificationService, Utils) {
      var vm = this,
        _fo;
      vm.removeTag = removeTag;

      init();

      function init() {

      }

      DecisionNotificationService.subscribeFilterTags(function(event, data) {
        _fo = angular.copy(data);
        createTagsList(_fo.filterQueries);
      });

      function removeTag(item, value) {
        var itemCopy = angular.copy(item);
        if (item.value && _.isArray(item.value)) { //Checkboxes
          Utils.removeItemFromArray(value, itemCopy.value);
        } else {
          itemCopy.queries = null;
          itemCopy.value = null;
        }
        itemCopy = _.omit(itemCopy, 'data');
        updateFilterObject(itemCopy);
      }

      function updateFilterObject(query) {
        var sendData = {
          'filterQueries': query
        };
        DecisionNotificationService.notifySelectCharacteristic(sendData);
      }

      function createTagsList(filterQueries) {
        if (!filterQueries) return;
        vm.tags = [];
        _.forEach(filterQueries, function(item) {
          // TODO: optimize
          // Currently all data shared in view
          vm.tags.push(caseQueryType(item));
        });
      }

      function caseQueryType(item) {
        var data = [];
        switch (item.type) {
          case "CompositeQuery":
            data[0] = item.queries[0].value + ' - ' + item.queries[1].value;
            break;
          default:
            data = _.isArray(item.value) ? item.value : [item.value];
        }
        item.data = data;
        return item;
        }
      }

    })();