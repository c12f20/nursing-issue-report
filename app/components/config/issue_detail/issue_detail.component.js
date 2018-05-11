'use strict';

nirControllers.controller('IssueDetailController', ['$scope', '$state', '$stateParams', '$filter', 'ngDialog', 'IssueService', 'OptionService',
  function($scope, $state, $stateParams, $filter, ngDialog, issueService, optionService) {
    // Options related dialogs
    $scope.dialog_info = {};
    function showDeleteOptionConfirmDialog(remove_options_array) {
      $scope.dialog_info.title = $filter('translate')('CAPTION_DELETE_OPTION');
      $scope.dialog_info.remove_data_note = $filter('translate')('MSG_REMOVE_OPTIONS_CONFIRM');
      $scope.dialog_info.to_remove_list = remove_options_array;
      $scope.onRemoveDialogConfirm = onRemoveOptionDialogConfirm;
      $scope.showDialog($scope, "components/config/remove-dlg-template.html");
    }

    function onRemoveOptionDialogConfirm(isYes) {
      if (!isYes) {
        $scope.dismissDialog();
        return;
      }
      $scope.dialog_info.to_remove_list.forEach((option) => {
        removeOptionInList(option);
      });
      if ($scope.issue_object.id) { // It's an Edit Issue, need record removed options
        issueService.appendRemovedOptions($scope.dialog_info.to_remove_list);
      }
      $scope.dismissDialog();
    }
    // Save/Cancel buttons
    $scope.isIssueChanged = function() {
      return !$scope.issue_object.equals(issueService.getEditingIssue());
    }

    $scope.isIssueValid = function() {
      return $scope.issue_object.name && $scope.issue_object.name.length > 0
    }

    $scope.onCancel = function() {
      $state.go('^.config', {open_state: [false, true]});
    }

    $scope.onSaveIssue = function() {
      let result;
      if ($scope.issue_object.id) {
        result = issueService.updateIssue($scope.issue_object, issueService.getRemovedOptionIds())
      } else {
        result = issueService.addIssue($scope.issue_object.name, $scope.issue_object.options);
      }
      result.then(null, (err) => {
        console.error(err);
      }).finally(() => {
        $state.go('^.config', {open_state: [false, true]});
      });
    }
    // Option Tree view
    $scope.options_info = {
      checkedAll: false,
    }

    $scope.expanding_property = {
      field: "index",
      displayName: $filter('translate')('CAPTION_INDEX'),
      cellTemplate: '<span class="tree-label" ng-click="user_clicks_branch(row.branch)">{{row.branch[expandingProperty.field]}}</span>'
    };
    $scope.col_defs = [
      {
        field: "name",
        displayName: $filter('translate')('CAPTION_OPTION_NAME'),
        cellTemplate: '<span class="tree-label" ng-click="user_clicks_branch(row.branch)">{{row.branch[col.field]}}</span>'
      },
      {
        field: "id",
        displayName: $filter('translate')('CAPTION_ACTION'),
        cellTemplate: '<button class="btn btn-info" ng-click="cellTemplateScope.onEditOption(row.branch)">{{"CAPTION_EDIT" | translate}}</button> \
        <button class="btn btn-danger" ng-click="cellTemplateScope.onDeleteOption(row.branch)">{{"CAPTION_DELETE" | translate}}</button>',
        cellTemplateScope: $scope
      }
    ];
    // Move Selected status related methods
    let cur_selected_option = undefined;
    $scope.onOptionSingleSelected = function(option) {
      cur_selected_option = option;
    }

    $scope.canMoveSelectOptionUp = function() {
      if (!cur_selected_option) {
        return false;
      }
      return cur_selected_option.index > 1;
    }

    $scope.canMoveSelectOptionDown = function() {
      if (!cur_selected_option) {
        return false;
      }
      if (cur_selected_option.parent_name) { // It's child option
        let parent_option = optionService.getRootOptionByName($scope.options_list, cur_selected_option.parent_name);
        return cur_selected_option.index < parent_option.children.length;
      } else { // It's a root option
        return cur_selected_option.index < $scope.options_list.length;
      }
    }

    function moveUpOptionInList(option, options_list) {
      let pos = options_list.indexOf(option);
      if (pos < 1) {
        console.error(`Can't move up option ${option.name}`);
        return;
      }
      let prev_option = options_list[pos-1];
      let original_index = option.index;
      option.index = prev_option.index;
      prev_option.index = original_index;
      options_list[pos-1] = option;
      options_list[pos] = prev_option;
    }

    function moveDownOptionInList(option, options_list) {
      let pos = options_list.indexOf(option);
      if (pos >= options_list.length-1) {
        console.error(`Can't move down option ${option.name}`);
        return;
      }
      let next_option = options_list[pos+1];
      let original_index = option.index;
      option.index = next_option.index;
      next_option.index = original_index;
      options_list[pos+1] = option;
      options_list[pos] = next_option;
    }

    $scope.onMoveOptionUp = function() {
      if (!cur_selected_option) {
        return;
      }
      if (cur_selected_option.parent_name) { // It's a child option
        let parent_option = optionService.getRootOptionByName($scope.options_list, cur_selected_option.parent_name);
        moveUpOptionInList(cur_selected_option, parent_option.children);
      } else { // It's a root option
        moveUpOptionInList(cur_selected_option, $scope.options_list);
      }
    }

    $scope.onMoveOptionDown = function() {
      if (!cur_selected_option) {
        return;
      }
      if (cur_selected_option.parent_name) { // It's a child option
        let parent_option = optionService.getRootOptionByName($scope.options_list, cur_selected_option.parent_name);
        moveDownOptionInList(cur_selected_option, parent_option.children);
      } else { // It's a root option
        moveDownOptionInList(cur_selected_option, $scope.options_list);
      }
    }
    // Delete related methods
    function updateIndexOfOptionList(options_list) {
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        option.index = i+1;
      }
    }
    function removeOptionInList(remove_option) {
      if (!$scope.options_list || $scope.options_list.length == 0) {
        return;
      }
      let remove_index = $scope.options_list.indexOf(remove_option);
      if (remove_index >= 0) {
        $scope.options_list.splice(remove_index, 1);
        updateIndexOfOptionList($scope.options_list);
        return;
      }
      for (let i=0; i < $scope.options_list.length; i++) {
        let option = $scope.options_list[i];
        if (option.children.length > 0) {
          remove_index = option.children.indexOf(remove_option);
          if (remove_index >= 0) {
            option.children.splice(remove_index, 1);
            updateIndexOfOptionList(option.children);
            return;
          }
        }
      }
      return false;
    }

    $scope.onDeleteOption = function(option) {
      console.log(`onDeleteOption, option: ${option.name}`);
      let remove_options_array = [option];
      option.children.forEach((child_option) => {
        remove_options_array.push(child_option);
      })
      showDeleteOptionConfirmDialog(remove_options_array);
    }
    // Edit related methods
    $scope.onEditOption = function(option) {
      console.log(`onEditOption, option: ${option.name}`);
    }

    // Load data methods
    $scope.page_info = {
      title: undefined,
    }
    $scope.options_list = undefined;

    $scope.issue_object = new Issue(undefined, "");
    function query_issue_details(issue) {
      issueService.queryIssueDetail(issue)
        .then((issue_object) => {
          // Save original editing issue data
          issueService.setEditingIssue(issue_object.clone());
          $scope.issue_object = issue_object;
          $scope.options_list = $scope.issue_object.options;
        }, (err) => {
          console.error(err);
        })
    }

    function load_data() {
      $scope.page_info.title = $filter('translate')('CAPTION_ADD_ISSUE');
      if ($stateParams.issue_object && ($stateParams.issue_object instanceof Issue)) {
        if ($stateParams.issue_object.id) {
          $scope.page_info.title = $filter('translate')('CAPTION_EDIT_ISSUE');
          if (!$stateParams.issue_object.options) {
            query_issue_details($stateParams.issue_object);
          }
        } else {
          $scope.issue_object = $stateParams.issue_object;
          $scope.options_list = $scope.issue_object.options;
        }
      } else {
        // Mark original editing issue data undefined for "New Issue" use case
        issueService.setEditingIssue(undefined);
      }
    }

    load_data();
  }]);
