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

      });
    }

    // Option Tree view
    function isOptionChecked(option) {
      if (!option) {
        return false;
      }
      if (option.checked) {
        return true;
      }
      if (option.children && option.children.length > 0) {
        for (let i=0; i < option.children.length; i++) {
          let option_child = option.children[i];
          if (isOptionChecked(option_child)) {
            return true;
          }
        }
      }
      return false;
    }

    $scope.hasCheckedOptions = function() {
      if (!$scope.options_list || $scope.options_list.length == 0) {
        return false;
      }
      for (let i=0; i < $scope.options_list.length; i++) {
        let option = $scope.options_list[i];
        if (isOptionChecked(option)) {
          return true;
        }
      }
      return false;
    }

    $scope.options_list = undefined;
    $scope.options_info = {
      checkedAll: false,
    }

    $scope.expanding_property = {
      field: "name",
      displayName: $filter('translate')('CAPTION_OPTION_NAME')
    };
    $scope.col_defs = [
      {
        field: "checked",
        displayName: $filter('translate')('CAPTION_CHECKED'),
        cellTemplate: '<input type="checkbox" ng-model="row.branch.checked" ng-change="cellTemplateScope.onOptionCheckedChanged(row.branch)" />',
        cellTemplateScope: $scope
      },
      {
        field: "id",
        displayName: $filter('translate')('CAPTION_ACTION'),
        cellTemplate: '<button class="btn btn-info" ng-click="cellTemplateScope.onEditOption(row.branch)">{{"CAPTION_EDIT" | translate}}</button> \
        <button class="btn btn-danger" ng-click="cellTemplateScope.onDeleteOption(row.branch)">{{"CAPTION_DELETE" | translate}}</button>',
        cellTemplateScope: $scope
      }
    ];

    $scope.onOptionCheckedChanged = function(option) {
      if (option.children) {
        option.children.forEach((option_child) => {
          option_child.checked = option.checked;
        });
      }
    }

    $scope.onEditOption = function(option) {
      console.log(`onEditOption, option: ${option.name}`);
    }

    $scope.onDeleteOption = function(option) {
      console.log(`onDeleteOption, option: ${option.name}`);
    }

    // Load data methods
    $scope.page_info = {
      title: undefined,
    }

    $scope.issue_object = new Issue(undefined, "");
    function query_issue_details(issue) {
      issueService.queryIssueDetail(issue)
        .then((issue_object) => {
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
          query_issue_details($stateParams.issue_object);
        } else {
          $scope.issue_object = $stateParams.issue_object;
          $scope.options_list = $scope.issue_object.options;
        }
      }
    }

    load_data();
  }]);
