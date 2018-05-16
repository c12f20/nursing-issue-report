'use strict';

nirControllers.controller('RootController', ['$scope', '$filter', '$state', 'ngDialog',
  function($scope, $filter, $state, ngDialog) {
    // Dialog part
    let dialog_id = undefined;

    $scope.dismissDialog = function() {
      if (dialog_id) {
        ngDialog.close(dialog_id);
        dialog_id = undefined;
      }
    }

    $scope.showDialog = function(dlg_scope, template_url) {
      dialog_id = ngDialog.open({
        template: template_url,
        scope: dlg_scope,
      });
    }

    // Main Menu part
    $scope.menu_list = [
      {href: 'root.home', index: 0, name: $filter('translate')('TITLE_HOME')},
      {href: 'root.demo', index: 1, name: $filter('translate')('DEMO')},
      {href: 'root.report', index: 2, name: $filter('translate')('TITLE_REPORT_LIST')},
      {href: 'root.config', index: 3, name: $filter('translate')('TITLE_CONFIG')},
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
