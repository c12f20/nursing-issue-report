'use strict';

nirControllers.controller('IssueDetailController', ['$scope', '$stateParams', '$filter', 'ngDialog', 'IssueService',
  function($scope, $stateParams, $filter, ngDialog, issueService) {
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
      $scope.dismissDialog();
    }
    // Save/Cancel buttons
    $scope.isIssueChanged = function() {
      return !$scope.issue_object.equals(issueService.getEditingIssue());
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
      if (cur_selected_option.parent_name) { // it's child option
        let parent_option = find_parent_option_by_name(cur_selected_option.parent_name);
        return cur_selected_option.index < parent_option.children.length;
      } else {
        return cur_selected_option.index < $scope.options_list.length;
      }
    }

    $scope.onMoveOptionUp = function() {
      if (!cur_selected_option) {
        return;
      }

    }
    // Delete related methods
    function removeOptionInList(remove_option) {
      if (!$scope.options_list || $scope.options_list.length == 0) {
        return;
      }
      let remove_index = $scope.options_list.indexOf(remove_option);
      if (remove_index >= 0) {
        $scope.options_list.splice(remove_index, 1);
        return;
      }
      for (let i=0; i < $scope.options_list.length; i++) {
        let option = $scope.options_list[i];
        if (option.children.length > 0) {
          remove_index = option.children.indexOf(remove_option);
          if (remove_index >= 0) {
            option.children.splice(remove_index, 1);
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
    function find_parent_option_by_name(name) {
      if (!$scope.options_list) {
        return undefined;
      }
      for (let i=0; i < $scope.options_list.length; i++) {
        let option = $scope.options_list[i];
        if (option.name == name) {
          return option;
        }
      }
      return undefined;
    }

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
