'use strict';

nirControllers.controller('ReportDetailController', ['$scope', '$filter', '$state', '$stateParams', 'ReportService', 'DepartmentService', 'IssueService', 'OptionService',
  function($scope, $filter, $state, $stateParams, reportService, departmentService, issueService, optionService) {
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
    // Save/Cancel Buttons
    $scope.isReportValid = function() {
      if (!$scope.editing_report || !$scope.editing_report.issue) {
        return true;
      }
      return optionService.isOptionTreeValueValid($scope.editing_report.issue.options);
    }

    $scope.isReportChanged = function() {
      return !$scope.editing_report.equals(orig_report);
    }

    function exitPage() {
      if (orig_report) {
        $state.go('^.report');
      } else {
        $state.go('^.home');
      }
    }

    $scope.onSaveReport = function() {
      let result;
      if (orig_report) { // It's editing report
        let remove_options = undefined;
        if (orig_report.issue.id != $scope.editing_report.issue.id) {
          remove_options = orig_report.issue.options;
        }
        result = reportService.updateReport($scope.editing_report, remove_options);
      } else { // It's new report
        result = reportService.addReport($scope.editing_report);
      }
      result.then(null, (err) => {
        console.error(err);
      }).finally(() => {
        exitPage();
      });
    }

    $scope.onCancel = function() {
      exitPage();
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

    function query_report_details() {
      issueService.queryIssueDetail($scope.editing_report.issue)
        .then((issue) => {
          $scope.editing_report.issue = issue;
          return reportService.queryReportDetails($scope.editing_report);
        })
        .then(() => {
          orig_report = $scope.editing_report.clone();
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
            if (!$scope.editing_report.issue) { // new report
              $scope.editing_report.issue = list[0];
              $scope.selected_issue = list[0];
              query_selected_issue();
            } else { // editing report
              for (let i=0; i < list.length; i++) {
                if ($scope.editing_report.issue.id == list[i].id && $scope.editing_report.issue.name == list[i].name) {
                  $scope.editing_report.issue = list[i];
                  $scope.selected_issue = list[i];
                  query_report_details();
                  break;
                }
              }
            }
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
    let orig_report = undefined;
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
