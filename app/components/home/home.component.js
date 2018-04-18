'use strict';

const mmdControllers = angular.module('mmdControllers');

mmdControllers.controller('HomeController', ['$scope', '$translate',
  function($scope, $translate) {
    $scope.switchLang = function(countryCode) {
      $translate.use(countryCode);
    }
  }]);
