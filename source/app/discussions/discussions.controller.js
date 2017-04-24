(function() {

  'use strict';

  angular
    .module('app.discussions')
    .controller('DiscussionsController', DiscussionsController);

  DiscussionsController.$inject = ['$rootScope', '$stateParams'];

  function DiscussionsController($rootScope, $stateParams) {
    var vm = this;

    $rootScope.breadcrumbs = [{
      title: 'Decisions',
      link: 'decisions'
    }, {
      title: vm.discussion.decision.name,
      link: 'decisions.matrix({id: ' + $stateParams.id + '})'
    }, {
      title: 'Discussions',
      link: 'decisions.discussions'
    }];


    console.log('Discussions controller');

  }
})();