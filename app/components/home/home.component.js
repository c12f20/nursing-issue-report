'use strict';

nirControllers.controller('HomeController', ['$scope', '$translate',
  function($scope, $translate) {
    $scope.switchLang = function(countryCode) {
      $translate.use(countryCode);
    }
  }]);
