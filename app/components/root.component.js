'use strict';

nirControllers.controller('RootController', ['$scope', '$state', 'DbService',
  function($scope, $state, dbService) {
    $scope.menu_list = [
      {href: '#!/home', index: 0, name: 'HOME'},
      {href: '#!/issues', index: 1, name: 'ISSUES'},
      {href: '#!/demo', index: 2, name: 'DEMO'}
    ];

    $scope.selected_index = 0;

    $scope.onMenuClicked = function(menu) {
      $scope.selected_index = menu.index;
    };

    // Always go to ‘home’ state of sub page
    $state.go('root.home');
    // onDestroy clear everything
    $scope.$on("$destroy", () => {
      dbService.destroy();
    });
  }]);
