import exampleHtml from './example.html';

/* @ngInject */
let exampleComponent = {
  template: exampleHtml,
  controllerAs: 'example',
  controller: function(exampleService, $ocLazyLoad) {
    const vm = this;
    vm.title = exampleService.title();
    // console.log($ocLazyLoad);
    $ocLazyLoad.load(require('../../1.js'));
  }

}
export default exampleComponent;
