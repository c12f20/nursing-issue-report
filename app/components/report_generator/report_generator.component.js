'use strict';

nirControllers.controller('ReportGeneratorController', ['$scope', '$state', '$q', 'DocxService', 'DepartmentService', 'IssueService', 'ReportService', 'OptionService',
  function($scope, $state, $q, docxService, departmentService, issueService, reportService, optionService) {
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
    // Report info input fields
    const DEFAULT_REPORT_TITLE = "护理不良事件分析报告";
    const DEFAULT_REPORT_AUTHOR = "上海市杨浦区中医医院   护理部";
    $scope.report_info = {
      title: DEFAULT_REPORT_TITLE,
      author: DEFAULT_REPORT_AUTHOR,
    };

    // Generate/Cancel button
    $scope.isReportValid = function() {
      return $scope.report_info.title && $scope.report_info.title.length > 0
        && $scope.report_info.author && $scope.report_info.author.length > 0;
    }

    function buildReportData() {
      let deferred = $q.defer();
      let departments_list, issues_list, department_issue_dict;
      issueService.queryIssues()
        .then((list) => {
          issues_list = list;
          return departmentService.queryDepartments();
        })
        .then((list) => {
          departments_list = list;
          let queryIssueInfoByDepartmentPromisesDict = {};
          for (let i=0; i < departments_list.length; i++) {
            let department_id = departments_list[i].id;
            queryIssueInfoByDepartmentPromisesDict[department_id] =
              reportService.queryIssueInfoByDepartment(department_id, $scope.date_range.start, $scope.date_range.end);
          }
          return $q.all(queryIssueInfoByDepartmentPromisesDict);
        })
        .then((dict) => {
          department_issue_dict = dict;
          return docxService.addIssueSummary(departments_list, issues_list, department_issue_dict);
        })
        .then((issue_count_dict) => {
          for (let i=0; i < issues_list.length; i++) {
            let issue = issues_list[i];
            buildIssueDetailData(issue, issue_count_dict[issue.id])
              .then(() => {
                if (i == issues_list.length-1) {
                  deferred.resolve();
                }
              }, (err) => {
                deferred.reject(err);
              })
          }
        }, (err) => {
          deferred.reject(err);
        })
      return deferred.promise;
    }

    function buildIssueDetailData(issue, count) {
      let deferred = $q.defer();
      if (!issue || !count) {
        if (issue) {
          console.log("Ignore issue "+issue.name+" as its count is 0");
        }
        deferred.resolve();
        return deferred.promise;
      }

      issueService.queryIssueDetail(issue)
        .then((issue_object) => {
          if (!issue_object.hasOptions()) {
            deferred.resolve();
            return;
          }
          let options_list = optionService.convertOptionTreeToList(issue_object.options);
          let queryOptionInfoByIdPromisesDict = {};
          for (let i=0; i < options_list.length; i++) {
            let option_id = options_list[i].id;
            queryOptionInfoByIdPromisesDict[option_id] =
              reportService.queryOptionInfoById(option_id, $scope.date_range.start, $scope.date_range.end);
          }
          return $q.all(queryOptionInfoByIdPromisesDict);
        })
        .then((dict) => {
          option_vallist_dict = dict;
          docxService.addIssueDetail(issue, count, option_vallist_dict)
            .then(() => {
              deferred.resolve();
            }, (err) => {
              deferred.reject(err);
            })
        }, (err) => {
          deferred.reject(err);
        })
      return deferred.promise;
    }

    const REPORT_TEMP_FOLDER_PATH = path.resolve(__dirname, "assets/docs");
    $scope.onGenerateReport = function() {
      docxService.initReportDocx(REPORT_TEMP_FOLDER_PATH, $scope.date_range.start, $scope.date_range.end);
      docxService.addReportTitle([$scope.report_info.title, $scope.report_info.author]);
      buildReportData()
        .then(() => {
          return docxService.generateReportDocx();
        })
        .then((file_path) => {
          let file_name = file_path.substring(file_path.lastIndexOf('/')+1);
          let downloadLink = angular.element('<a></a>');
          downloadLink.attr('href', file_path);
          downloadLink.attr('download', file_name);
			    downloadLink[0].click();

          $state.go('^.home');
        }, (err) => {
          console.error(err);
        })
    }

    $scope.onCancel = function() {
      $state.go('^.home');
    }
  }]);
