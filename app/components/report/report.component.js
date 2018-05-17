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

    // Load data methods
    function load_report_list(start_date, end_date) {
      
    }

    load_report_list();
  }]);
