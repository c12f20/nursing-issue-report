'use strict';

nirControllers.controller('IssueDetailController', ['$scope', '$stateParams', '$filter', 'IssueService',
  function($scope, $stateParams, $filter, issueService) {
    // Dialog related methods
    let dialog_id = undefined;
    $scope.dialog_info = {};

    function dismissDialog() {
      if (dialog_id) {
        ngDialog.close(dialog_id);
      }
    }
    // Options related dialogs
    function showDeleteOptionConfirmDialog(remove_options_array) {
      $scope.dialog_info.title = $filter('translate')('CAPTION_DELETE_OPTION');
      $scope.dialog_info.remove_data_note = $filter('translate')('MSG_REMOVE_OPTIONS_CONFIRM');
      $scope.dialog_info.to_remove_list = remove_options_array;
      $scope.onRemoveDialogConfirm = onRemoveOptionDialogConfirm;
      dialog_id = ngDialog.open({
        template: "components/config/remove-dlg-template.html",
        scope: $scope,
      });
    }

    function onRemoveOptionDialogConfirm(isYes) {
      if (!isYes) {
        dismissDialog();
        return;
      }
      $scope.dialog_info.to_remove_list.forEach((option) => {

      });
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
          load_options_list();
        }, (err) => {
          console.error(err);
        })
    }

    const OPTIONS_COUNT_PER_PAGE = 5;
    const OPTIONS_MAX_COUNT_PAGES = 5;
    $scope.options_list = undefined;
    $scope.options_info = {
      checkedAll: false,
      count_per_page: OPTIONS_COUNT_PER_PAGE,
      max_count_pages: OPTIONS_MAX_COUNT_PAGES,
      total_count: 0,
      cur_page: 1,
    }
    function load_options_list() {
      let count = $scope.issue_object.options.length;
      if (count == 0) {
        return;
      }
      $scope.options_info.total_count = count;
      let total_pages_count = Math.ceil(count / $scope.options_info.count_per_page);
      if ($scope.options_info.cur_page > total_pages_count) {
        $scope.options_info.cur_page = total_pages_count;
      }
      load_options_page_at($scope.options_info.cur_page)
    }

    function load_options_page_at(page_index) {
      let offset = (page_index-1) * $scope.options_info.count_per_page;
      let count = $scope.options_info.count_per_page;
      $scope.options_list = $scope.issue_object.options.slice(offset, offset+count);
    }

    function load_data() {
      $scope.page_info.title = $filter('translate')('CAPTION_ADD_ISSUE');
      if ($stateParams.issue_object && ($stateParams.issue_object instanceof Issue)) {
        if ($stateParams.issue_object.id) {
          $scope.page_info.title = $filter('translate')('CAPTION_EDIT_ISSUE');
          query_issue_details($stateParams.issue_object);
        } else {
          $scope.issue_object = $stateParams.issue_object;
          load_options_list();
        }
      }
    }

    load_data();
  }]);
