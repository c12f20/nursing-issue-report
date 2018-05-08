'use strict';

nirControllers.controller('ConfigController', ['$scope', '$filter', '$state', 'ngDialog', 'DepartmentService', 'IssueService',
  function($scope, $filter, $state, ngDialog, departmentService, issueService) {
    // Department Panel
    $scope.department_panel = {
      open: false,
    };
    // About checkbox on the department list
    $scope.onCheckAllDepartments = function() {
      if (!$scope.department_list || $scope.department_list.length == 0) {
        return;
      }
      $scope.department_list.forEach((department) => {
        department.checked = $scope.departments_info.checkedAll;
      });
    }

    $scope.hasCheckedDepartments = function() {
      if (!$scope.department_list || $scope.department_list.length == 0) {
        return false;
      }
      for (let i=0; i < $scope.department_list.length; i++) {
        let department = $scope.department_list[i];
        if (department.checked) {
          return true;
        }
      }
      return false;
    }
    // Department related dialogs
    $scope.dialog_info = {};
    function showDeleteDepartmentConfirmDialog(remove_departments_array) {
      $scope.dialog_info.title = $filter('translate')('CAPTION_DELETE_DEPARTMENT');
      $scope.dialog_info.remove_data_note = $filter('translate')('MSG_REMOVE_DEPARTMENTS_CONFIRM');
      $scope.dialog_info.to_remove_list = remove_departments_array;
      $scope.onRemoveDialogConfirm = onRemoveDepartmentDialogConfirm;
      $scope.showDialog($scope, "components/config/remove-dlg-template.html");
    }

    function onRemoveDepartmentDialogConfirm(isYes) {
      if (!isYes) {
        $scope.dismissDialog();
        return;
      }
      let to_remove_departments_ids = [];
      $scope.dialog_info.to_remove_list.forEach((department) => {
        to_remove_departments_ids.push(department.id);
      });
      departmentService.removeDepartments(to_remove_departments_ids)
        .then(() => {
          query_departments_info();
        }, (err) => {
          console.error(err);
        }).finally(() => {
          $scope.dismissDialog();
        });
    }

    $scope.isEditDataValid = function() {
      if ($scope.dialog_info.department_object) {
        return $scope.dialog_info.department_name && $scope.dialog_info.department_name.length > 0 && $scope.dialog_info.department_object.name != $scope.dialog_info.department_name;
      } else {
        return $scope.dialog_info.department_name && $scope.dialog_info.department_name.length > 0;
      }
    }

    $scope.onEditDialogConfirm = function(isYes) {
      if (!isYes) {
        $scope.dismissDialog();
        return;
      }
      if (!$scope.dialog_info.department_name || $scope.dialog_info.department_name.length == 0) {
        $scope.dismissDialog();
        return;
      }

      if ($scope.dialog_info.department_object) {
        if ($scope.dialog_info.department_object.name == $scope.dialog_info.department_name) {
          $scope.dismissDialog();
          return;
        }
        $scope.dialog_info.department_object.name = $scope.dialog_info.department_name;
        departmentService.updateDepartment($scope.dialog_info.department_object).then(() => {
          query_departments_info();
        }, (err) => {
          console.error(err);
        }).finally(() => {
          $scope.dismissDialog();
        });
      } else {
        departmentService.addDepartment($scope.dialog_info.department_name).then(() => {
          query_departments_info();
        }, (err) => {
          console.error(err);
        }).finally(() => {
          $scope.dismissDialog();
        });
      }
    }

    function showEditDepartmentDialog(department_object) {
      if (department_object) {
        $scope.dialog_info.title = $filter('translate')('CAPTION_EDIT_DEPARTMENT');
        $scope.dialog_info.department_object = department_object;
        $scope.dialog_info.department_name = department_object.name;
        $scope.dialog_info.button_caption = $filter('translate')('CAPTION_UPDATE');
      } else {
        $scope.dialog_info.title = $filter('translate')('CAPTION_ADD_DEPARTMENT');
        $scope.dialog_info.department_object = undefined;
        $scope.dialog_info.department_name = "";
        $scope.dialog_info.button_caption = $filter('translate')('CAPTION_ADD');
      }
      $scope.showDialog($scope, "components/config/department-edit-dlg-template.html");
    }

    // methods of action buttons
    $scope.onDeleteDepartment = function(index) {
      let department = $scope.department_list[index];
      console.log(`Delete Department ${department.name}`);
      showDeleteDepartmentConfirmDialog([department]);
    }

    $scope.onDeleteCheckedDepartments = function() {
      if (!$scope.department_list || $scope.department_list.length == 0) {
        return;
      }
      let to_remove_list = [];
      $scope.department_list.forEach((department) => {
        if (department.checked) {
          console.log(`Delete Department ${department.name}`);
          to_remove_list.push(department);
        }
      });
      showDeleteDepartmentConfirmDialog(to_remove_list);
    }

    $scope.onAddDepartment = function() {
      console.log('Add new Department');
      showEditDepartmentDialog();
    }

    $scope.onEditDepartment = function(index) {
      let department = $scope.department_list[index];
      console.log(`Edit Department ${department.name}`);
      showEditDepartmentDialog(department);
    }

    // Load departments list methods
    const DEPARTMENT_COUNT_PER_PAGE = 5;
    const DEPARTMENT_MAX_COUNT_PAGES = 5;
    $scope.departments_info = {
      checkedAll: false,
      count_per_page: DEPARTMENT_COUNT_PER_PAGE,
      max_count_pages: DEPARTMENT_MAX_COUNT_PAGES,
      total_count: 0,
      cur_page: 1,
    }

    function query_departments_info() {
      departmentService.queryDepartmentsCount()
        .then((count) => {
          $scope.departments_info.total_count = count;
          let total_pages_count = Math.ceil(count / $scope.departments_info.count_per_page);
          if ($scope.departments_info.cur_page > total_pages_count) {
            $scope.departments_info.cur_page = total_pages_count;
          }
          load_departments_page_at($scope.departments_info.cur_page);
        }, (err) => {
          console.error(err);
        });
    }

    $scope.department_list = undefined;
    function load_departments_page_at(page_index) {
      let offset = (page_index-1) * $scope.departments_info.count_per_page;
      let count = $scope.departments_info.count_per_page;
      departmentService.queryDepartments(offset, count)
        .then((list) => {
          $scope.departments_info.checkedAll = false;
          $scope.department_list = list;
        }, (err) => {
          console.error(err);
        });
    }

    $scope.onDepartmentPageChanged = function() {
      load_departments_page_at($scope.departments_info.cur_page);
    }

    query_departments_info();

    // Issue Panel
    $scope.issue_panel = {
      open: false,
    };
    // About checkbox on the department list
    $scope.onCheckAllIssues = function() {
      if (!$scope.issue_list || $scope.issue_list.length == 0) {
        return;
      }
      $scope.issue_list.forEach((issue) => {
        issue.checked = $scope.issues_info.checkedAll;
      });
    }

    $scope.hasCheckedIssues = function() {
      if (!$scope.issue_list || $scope.issue_list.length == 0) {
        return false;
      }
      for (let i=0; i < $scope.issue_list.length; i++) {
        let issue = $scope.issue_list[i];
        if (issue.checked) {
          return true;
        }
      }
      return false;
    }
    // Issue related Dialog
    function showDeleteIssueConfirmDialog(remove_issues_array) {
      $scope.dialog_info.title = $filter('translate')('CAPTION_DELETE_ISSUE');
      $scope.dialog_info.remove_data_note = $filter('translate')('MSG_REMOVE_ISSUE_CONFIRM');
      $scope.dialog_info.to_remove_list = remove_issues_array;
      $scope.onRemoveDialogConfirm = onRemoveIssueDialogConfirm;
      dialog_id = ngDialog.open({
        template: "components/config/remove-dlg-template.html",
        scope: $scope,
      });
    }

    function onRemoveIssueDialogConfirm(isYes) {
      if (!isYes) {
        $scope.dismissDialog();
        return;
      }
      let to_remove_issues_ids = [];
      $scope.dialog_info.to_remove_list.forEach((issue) => {
        to_remove_issues_ids.push(issue.id);
      });
      issueService.removeIssues(to_remove_issues_ids)
        .then(() => {
          query_issues_info();
        }, (err) => {
          console.error(err);
        }).finally(() => {
          $scope.dismissDialog();
        });
    }
    // methods of action buttons
    $scope.onDeleteIssue = function(index) {
      let issue = $scope.issue_list[index];
      console.log(`Delete Issue ${issue.name}`);
      showDeleteIssueConfirmDialog([issue]);
    }

    $scope.onDeleteCheckedIssues = function() {
      if (!$scope.issue_list || $scope.issue_list.length == 0) {
        return;
      }
      let to_remove_list = [];
      $scope.issue_list.forEach((issue) => {
        if (issue.checked) {
          console.log(`Delete Issue ${issue.name}`);
          to_remove_list.push(issue);
        }
      });
      showDeleteIssueConfirmDialog(to_remove_list);
    }

    $scope.onAddIssue = function() {
      console.log('Add new Issue');
      showEditIssuePage();
    }

    $scope.onEditIssue = function(index) {
      let issue = $scope.issue_list[index];
      console.log(`Edit Issue ${issue.name}`);
      showEditIssuePage(issue);
    }

    function showEditIssuePage(issue_object) {
      if (issue_object && issue_object.id) {
        $state.go('root.issue_detail', {issue_object: issue_object});
      } else {
        $state.go('root.issue_detail');
      }
    }

    // Load issues list methods
    const ISSUE_COUNT_PER_PAGE = 5;
    const ISSUE_MAX_COUNT_PAGES = 5;
    $scope.issues_info = {
      checkedAll: false,
      count_per_page: DEPARTMENT_COUNT_PER_PAGE,
      max_count_pages: DEPARTMENT_MAX_COUNT_PAGES,
      total_count: 0,
      cur_page: 1,
    }

    function query_issues_info() {
      issueService.queryIssuesCount()
        .then((count) => {
          $scope.issues_info.total_count = count;
          let total_pages_count = Math.ceil(count / $scope.issues_info.count_per_page);
          if ($scope.issues_info.cur_page > total_pages_count) {
            $scope.issues_info.cur_page = total_pages_count;
          }
          load_issues_page_at($scope.issues_info.cur_page);
        }, (err) => {
          console.error(err);
        });
    }

    $scope.issue_list = undefined;
    function load_issues_page_at(page_index) {
      let offset = (page_index-1) * $scope.issues_info.count_per_page;
      let count = $scope.issues_info.count_per_page;
      issueService.queryIssues(offset, count)
        .then((list) => {
          $scope.issues_info.checkedAll = false;
          $scope.issue_list = list;
        }, (err) => {
          console.error(err);
        });
    }

    $scope.onIssuePageChanged = function() {
      load_issues_page_at($scope.issues_info.cur_page);
    }

    query_issues_info();
  }]);
