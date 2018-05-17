'use strict';

nirControllers.controller('ReportController', ['$scope', 'ReportService',
  function($scope, reportService) {
    // Date Range UI
    $scope.date_range = {
      start: new Date(),
      end: new Date()
    }

    $scope.start_date_popup = {
      opened: false
    };

    $scope.openStartDatePopup = function() {
      $scope.start_date_popup.opened = true;
    }

    $scope.end_date_popup = {
      opened: false
    };

    $scope.openEndDatePopup = function() {
      $scope.end_date_popup.opened = true;
    }
    // Report List UI
    const REPORT_COUNT_PER_PAGE = 5;
    const REPORT_MAX_COUNT_PAGES = 5;
    $scope.reports_info = {
      checkedAll: false,
      count_per_page: REPORT_COUNT_PER_PAGE,
      max_count_pages: REPORT_MAX_COUNT_PAGES,
      total_count: 0,
      cur_page: 1,
    }

    $scope.onReportPageChanged = function() {
      load_reports_page_at($scope.reports_info.cur_page);
    }

    $scope.report_list = undefined;

    function load_reports_page_at(page_index, start_date, end_date) {
      let offset = (page_index-1) * $scope.reports_info.count_per_page;
      let count = $scope.reports_info.count_per_page;
      reportService.queryReports(offset, count, start_date, end_date)
        .then((list) => {
          $scope.reports_info.checkedAll = false;
          $scope.report_list = list;
        }, (err) => {
          console.error(err);
        });
    }

    function load_report_list(start_date, end_date) {
      reportService.queryReportsCount(start_date, end_date)
        .then((count) => {
          $scope.reports_info.total_count = count;
          let total_pages_count = Math.ceil(count / $scope.reports_info.count_per_page);
          if ($scope.reports_info.cur_page > total_pages_count) {
            $scope.reports_info.cur_page = total_pages_count;
          }
          load_reports_page_at($scope.reports_info.cur_page);
        }, (err) => {
          console.error(err);
        });
    }

    load_report_list();
  }]);
