'use strict';

nirControllers.controller('ReportGeneratorController', ['$scope', '$state',
  function($scope, $state) {
    // Date Range UI
    $scope.date_range = {
      start: undefined,
      end: new Date(),
    }

    function initDateRange() {
      let end_date = $scope.date_range.end
      let end_month = end_date.getMonth();
      if (end_month >= 9) {
        $scope.date_range.start = new Date(end_date.getFullYear(), 9, 1);
      } else if (end_month >= 6) {
        $scope.date_range.start = new Date(end_date.getFullYear(), 6, 1);
      } else if (end_month >= 3) {
        $scope.date_range.start = new Date(end_date.getFullYear(), 3, 1);
      } else {
        $scope.date_range.start = new Date(end_date.getFullYear(), 0, 1);
      }
    }

    initDateRange();

    $scope.start_date_popup = {
      opened: false
    };

    $scope.openStartDatePopup = function() {
      $scope.start_date_popup.opened = true;
    }

    $scope.onStartDateChanged = function() {
      if ($scope.date_range.start > $scope.date_range.end) {
        initDateRange();
      }
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
        initDateRange();
      }
    }
  }]);
