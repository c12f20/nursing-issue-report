'use strict';

nirControllers.controller('ReportController', ['$scope', '$filter', '$state', 'ReportService',
  function($scope, $filter, $state, reportService) {
    // Date Range UI
    $scope.date_range = {
      start: undefined,
      end: new Date()
    }

    $scope.start_date_popup = {
      opened: false
    };

    $scope.openStartDatePopup = function() {
      $scope.start_date_popup.opened = true;
    }

    $scope.onStartDateChanged = function() {
      if ($scope.date_range.start > $scope.date_range.end) {
        $scope.date_range.start = new Date($scope.date_range.end);
        $scope.date_range.start.setHours(0);
        $scope.date_range.start.setMinutes(0);
        $scope.date_range.start.setSeconds(0);
        $scope.date_range.start.setMilliseconds(0);
      }
      load_report_list();
    }

    $scope.end_date_popup = {
      opened: false
    };

    $scope.openEndDatePopup = function() {
      $scope.end_date_popup.opened = true;
    }

    $scope.onEndDateChanged = function() {
      if (!$scope.date_range.end) {
        $scope.date_range.end = new Date();
      }
      if ($scope.date_range.end < $scope.date_range.start) {
        $scope.date_range.end = new Date($scope.date_range.start);
        $scope.date_range.end.setHours(23);
        $scope.date_range.end.setMinutes(59);
        $scope.date_range.end.setSeconds(59);
      }
      load_report_list();
    }
    // Delete Report UI
    $scope.dialog_info = {};
    function showDeleteReportConfirmDialog(remove_report) {
      $scope.dialog_info.title = $filter('translate')('CAPTION_DELETE_REPORT');
      $scope.dialog_info.remove_data_note = $filter('translate')('MSG_REMOVE_REPORT_CONFIRM');
      $scope.dialog_info.to_remove_report = remove_report;
      $scope.onRemoveDialogConfirm = onRemoveReportDialogConfirm;
      $scope.showDialog($scope, "components/report/remove-dlg-template.html");
    }

    function onRemoveReportDialogConfirm(isYes) {
      if (!isYes) {
        $scope.dismissDialog();
        return;
      }
      reportService.removeReport(remove_report.id)
        .then(() => {
          load_report_list();
        }, (err) => {
          console.error(err);
        }).finally(() => {
          $scope.dismissDialog();
        });
    }

    $scope.onDeleteReport = function(index) {
      let report = $scope.report_list[index];
      console.log(`Delete Report ${report.creation_time}, ${report.department.name}, ${report.issue.name}`);
      showDeleteReportConfirmDialog(report);
    }

    // Edit Report UI
    $scope.onEditReportDetail = function(index) {

    }

    // Report List UI
    const REPORT_COUNT_PER_PAGE = 5;
    const REPORT_MAX_COUNT_PAGES = 5;
    $scope.reports_info = {
      count_per_page: REPORT_COUNT_PER_PAGE,
      max_count_pages: REPORT_MAX_COUNT_PAGES,
      total_count: 0,
      cur_page: 1,
    }

    $scope.onReportPageChanged = function() {
      load_reports_page_at($scope.reports_info.cur_page);
    }

    $scope.report_list = undefined;

    function load_reports_page_at(page_index) {
      let offset = (page_index-1) * $scope.reports_info.count_per_page;
      let count = $scope.reports_info.count_per_page;
      reportService.queryReports(offset, count, $scope.date_range.start, $scope.date_range.end)
        .then((list) => {
          $scope.report_list = list;
        }, (err) => {
          console.error(err);
        });
    }

    function load_report_list() {
      if (!$scope.date_range.start) {
        reportService.queryReportsMinCreationTime()
          .then((min_creation_time) => {
            $scope.date_range.start = new Date(min_creation_time);
          }, (err) => {
            console.error(err);
          });
      }
      reportService.queryReportsCount($scope.date_range.start, $scope.date_range.end)
        .then((count) => {
          $scope.reports_info.total_count = count;
          let total_pages_count = Math.ceil(count / $scope.reports_info.count_per_page);
          if ($scope.reports_info.cur_page > total_pages_count) {
            $scope.reports_info.cur_page = total_pages_count == 0 ? 1 : total_pages_count;
          }
          load_reports_page_at($scope.reports_info.cur_page, $scope.date_range.start, $scope.date_range.end);
        }, (err) => {
          console.error(err);
        });
    }

    load_report_list();
  }]);
