'use strict';

nirControllers.controller('RootController', ['$scope', '$state', 'DbService',
  function($scope, $state, dbService) {
    // Always go to ‘home’ state of sub page
    $state.go('root.home');
    // onDestroy clear everything
    $scope.$on("$destroy", () => {
      dbService.onDestroy();
    });
  }]);
