'use strict';

nirControllers.controller('RootController', ['$scope', '$state', 'DbService',
  function($scope, $state, dbService) {
    $state.go('root.home');
    // onDestroy clear everything
    $scope.$on("$destroy", () => {
      dbService.onDestroy();
    });
  }]);
