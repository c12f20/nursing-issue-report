'use strict';

nirControllers.controller('ReportDetailController', ['$scope', '$filter', '$state', '$stateParams', 'ReportService', 'DepartmentService', 'IssueService',
  function($scope, $filter, $state, $stateParams, reportService, departmentService, issueService) {
    // Creation Date UI part
    $scope.creation_date_popup = {
      opened: false
    };

    $scope.openCreationDatePopup = function() {
      $scope.creation_date_popup.opened = true;
    }
    // Department Selector
    $scope.selected_department = undefined;

    $scope.onDepartmentChanged = function() {
      console.log("Change department to be "+JSON.stringify($scope.selected_department));
      $scope.editing_report.department = $scope.selected_department;
    }
    // Issue Selector
    $scope.selected_issue = undefined;

    $scope.onIssueChanged = function() {
      console.log("Change issue to be "+JSON.stringify($scope.selected_issue));
      $scope.editing_report.issue = $scope.selected_issue;
      query_selected_issue();
    }
    // Load data methods

    function query_selected_issue() {
      issueService.queryIssueDetail($scope.editing_report.issue)
        .then((issue) => {
          $scope.editing_report.issue = issue;
        }, (err) => {
          console.error(err);
        })
    }

    $scope.issues_list = [];
    function load_issues() {
      issueService.queryIssues()
        .then((list) => {
          $scope.issues_list = list;
          if (list && list.length > 0) {
            if (!$scope.editing_report.issue) {
              $scope.editing_report.issue = list[0];
              $scope.selected_issue = list[0];
            } else {
              for (let i=0; i < list.length; i++) {
                if ($scope.editing_report.issue.id == list[i].id && $scope.editing_report.issue.name == list[i].name) {
                  $scope.selected_issue = list[i];
                  break;
                }
              }
            }
            query_selected_issue();
          }
        }, (err) => {
          console.error(err);
        })
    }

    $scope.departments_list = undefined;
    function load_departments() {
      departmentService.queryDepartments()
        .then((list) => {
          $scope.departments_list = list;
          if (list && list.length > 0) {
            if (!$scope.editing_report.department) {
              $scope.editing_report.department = list[0];
              $scope.selected_department = list[0];
            } else {
              for (let i=0; i < list.length; i++) {
                if ($scope.editing_report.department.id == list[i].id && $scope.editing_report.department.name == list[i].name) {
                  $scope.selected_department = list[i];
                  break;
                }
              }
            }
          }
        }, (err) => {
          console.error(err);
        })
    }

    $scope.page_info = {
      title: $filter('translate')('CAPTION_NEW_REPORT'),
    }
    $scope.editing_report = undefined;
    function load_editing_data() {
      $scope.page_info.title = $filter('translate')('CAPTION_EDIT_REPORT');
      $scope.editing_report = $stateParams.report_object;
    }

    function load_new_data() {
      $scope.page_info.title = $filter('translate')('CAPTION_NEW_REPORT');
      $scope.editing_report = new Report(undefined, undefined, undefined);
      $scope.editing_report.creation_time = new Date();
    }

    function load_data() {
      if ($stateParams.report_object && $stateParams.report_object instanceof Report) {
        load_editing_data();
      } else {
        load_new_data();
      }
      load_departments();
      load_issues();
    }

    load_data();
  }]);
