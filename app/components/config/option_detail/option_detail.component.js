'use strict';

nirControllers.controller('OptionDetailController', ['$scope', '$state', '$stateParams', '$filter', 'OptionService',
  function($scope, $state, $stateParams, $filter, optionService) {
    // Option Parent Dropdown Selector
    $scope.canHaveParent = function() {
      return $scope.root_options_list.length > 1
        && !($scope.option_object.children && $scope.option_object.children.length > 0);
    }
    let OPTION_NONE = new Option(undefined, $filter('translate')('CAPTION_NONE'), []);
    $scope.selected_parent_object = OPTION_NONE;
    $scope.onSelectParentOption = function(option) {
      $scope.selected_parent_object = option;
    }

    // Option Values list
    $scope.values_list = [];
    $scope.addOptionValueInput = function() {
      $scope.values_list.push({"name": ""});
    }

    $scope.removeOptionValueInput = function(index) {
      $scope.values_list.splice(index, 1);
    }

    // Save/Cancel buttons
    function updateOptionValuesName() {
      let new_value_names = [];
      $scope.values_list.forEach((option_value_object) => {
        if (option_value_object.name.length > 0) {
          new_value_names.push(option_value_object.name);
        }
      })
      $scope.option_object.value_names = new_value_names;
    }

    $scope.isOptionChanged = function() {
      updateOptionValuesName();
      return !$scope.option_object.equals(editing_option);
    }
    $scope.isOptionValid = function() {
      return $scope.option_object.name && $scope.option_object.name.length > 0;
    }

    function saveNewOption() {
      if (!editing_issue.options) {
        editing_issue.options = [];
      }
      if ($scope.selected_parent_object.equals(OPTION_NONE)) {
        $scope.option_object.index = editing_issue.options.length+1;
        editing_issue.options.push($scope.option_object);
      } else {
        $scope.option_object.index = $scope.selected_parent_object.children.length+1;
        $scope.selected_parent_object.children.push($scope.option_object);
      }
    }

    function saveUpdatedOption() {
      editing_option.name = $scope.option_object.name;
      editing_option.value_names = $scope.option_object.value_names;

      if (editing_option.parent_name) { // original option has a parent option
        let orignal_parent_object = optionService.getRootOptionByName(editing_issue.options, editing_option.parent_name);
        if ($scope.selected_parent_object.equals(OPTION_NONE)) { // New parent is null
          orignal_parent_object.children.splice(orignal_parent_object.children.indexOf(editing_option), 1);
          optionService.updateListIndex(orignal_parent_object.children);
          editing_issue.index = editing_issue.options.length+1;
          editing_issue.options.push(editing_issue);
        } else if ($scope.selected_parent_object.name != editing_option.parent_name) { // New parent is not same as the original one
          orignal_parent_object.children.splice(orignal_parent_object.children.indexOf(editing_option), 1);
          optionService.updateListIndex(orignal_parent_object.children);
          editing_issue.index = $scope.selected_parent_object.children.length+1;
          $scope.selected_parent_object.children.push(editing_issue);
        }
      } else { // original option is a root option
        if (!$scope.selected_parent_object.equals(OPTION_NONE)) { // New parent isn't null
          editing_issue.options.splice(editing_issue.options.indexOf(editing_option), 1);
          optionService.updateListIndex(editing_issue.options);
          editing_issue.index = $scope.selected_parent_object.children.length+1;
          $scope.selected_parent_object.children.push(editing_issue);
        }
      }
    }

    $scope.onSaveOption = function() {
      if (editing_option) { // It's an updated option
        saveUpdatedOption();
      } else { // It's a new option
        saveNewOption();
      }
      $state.go('^.issue_detail', {issue_object: editing_issue});
    }

    $scope.onCancel = function() {
      $state.go('^.issue_detail', {issue_object: editing_issue});
    }

    // Load data methods
    $scope.page_info = {
      title: $filter('translate')('CAPTION_ADD_OPTION'),
      caption_btn_confirm: $filter('translate')('CAPTION_ADD')
    }
    $scope.root_options_list = [OPTION_NONE];
    $scope.option_object = new Option(undefined, "", []);

    let editing_issue = undefined;
    let editing_option = undefined;
    function load_data() {
      editing_issue = $stateParams.issue_object;
      editing_option = $stateParams.option_object;
      if (!editing_issue) {
        console.error("Failed to edit option without editing issue");
        return;
      }
      if (editing_issue.options) {
        for (let i=0; i < editing_issue.options.length; i++) {
          let option = editing_issue.options[i];
          if (editing_option && (editing_option instanceof Option)) {
            if (option.equals(editing_option)) {
              continue;
            }
          }
          $scope.root_options_list.push(option);
        }
      }

      $scope.page_info.title = $filter('translate')('CAPTION_ADD_OPTION');
      $scope.page_info.caption_btn_confirm = $filter('translate')('CAPTION_ADD');
      if (editing_option && (editing_option instanceof Option)) {
        $scope.page_info.title = $filter('translate')('CAPTION_EDIT_OPTION');
        $scope.page_info.caption_btn_confirm = $filter('translate')('CAPTION_UPDATE');

        $scope.option_object = editing_option.clone();
        if ($scope.option_object.parent_name) {
          $scope.selected_parent_object = optionService.getRootOptionByName(editing_issue.options, $scope.option_object.parent_name);
        }
        for (let i=0; i < $scope.option_object.value_names.length; i++) {
          $scope.values_list.push({"name": $scope.option_object.value_names[i]});
        }
      }
    }

    load_data();
  }]);
