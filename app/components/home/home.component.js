'use strict';

nirControllers.controller('HomeController', ['$scope', '$state',
  function($scope, $state) {
    $scope.onNewReport = function() {
      $state.go('^.report_detail');
    }
  }]);
