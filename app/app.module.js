'use strict';

const nirServices = angular.module('nirServices', [
  'pascalprecht.translate'
]);

const nirControllers = angular.module('nirControllers', [
  'nirServices',
  'ui.bootstrap',
  'ngDialog',
  'treeGrid',
]);

const nirApp = angular.module('nirApp', [
  'ngSanitize',
  'ui.router',
  'nirControllers',
]);
