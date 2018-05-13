'use strict';

nirControllers.controller('OptionDetailController', ['$scope', '$state', '$stateParams', '$filter', 'OptionService',
  function($scope, $state, $stateParams, $filter, optionService) {
    // Option Parent Dropdown Selector
    $scope.canHaveParent = function() {
      return !($scope.option_object && $scope.option_object.children && $scope.option_object.children.length > 0)
    }
    let OPTION_NONE = new Option(undefined, $filter('translate')('CAPTION_NONE'), []);
    $scope.selected_parent_object = OPTION_NONE;

    // Load data methods
    $scope.page_info = {
      title: undefined,
    }

    let editing_issue = undefined;
    function load_data() {
      editing_issue = $stateParams.issue_object;
      if (!editing_issue) {
        console.error("Failed to edit option without editing issue");
        return;
      }
      $scope.root_options_list = [null];
      for (let i=0; i < editing_issue.options.length; i++) {
        let option = editing_issue.options[i];
        $scope.root_options_list.push(option);
      }

      $scope.page_info.title = $filter('translate')('CAPTION_ADD_OPTION');
      if ($stateParams.option_object && ($stateParams.option_object instanceof Option)) {
        if ($stateParams.option_object.id) {
          $scope.page_info.title = $filter('translate')('CAPTION_EDIT_OPTION');
        }
        $scope.option_object = $stateParams.option_object;
        if ($scope.option_object.parent_name) {
          $scope.selected_parent_object = optionService.getRootOptionByName(editing_issue.options, $scope.option_object.parent_name);
        }
        $scope.values_list = $scope.option_object.value_names;
      }
    }

    load_data();
  }]);
