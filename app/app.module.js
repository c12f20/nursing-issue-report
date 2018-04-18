'use strict';

angular.module('mmdServices', ['pascalprecht.translate']);

angular.module('mmdControllers', ['mmdServices']);

angular.module('mmdApp', [
  'ngRoute',
  'ngSanitize',
  'mmdControllers',
]);
