import angular from 'angular';
import uirouter from 'angular-ui-router';
import example from './example/example.module';
import oclazyload from 'oclazyload';

require('./main.scss');
angular.module('app', [
  uirouter,
  oclazyload,
  'example'
]);
