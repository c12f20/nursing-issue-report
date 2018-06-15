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
          return docxService.buildIssueSummary(departments_list, issues_list, department_issue_dict);
        })
        .then((result) => {
          let report_data = result.data;
          let issue_count_dict = result.dict;
          let buildIssueDetailPromises = [];
          for (let i=0; i < issues_list.length; i++) {
            let issue = issues_list[i];
            buildIssueDetailPromises.push(buildIssueDetailData(issue, issue_count_dict[issue.id]));
          }
          $q.all(buildIssueDetailPromises).then((issues_data) => {
            for (let i=0; i < issues_data.length; i++) {
              report_data = report_data.concat(issues_data[i]);
            }
            deferred.resolve(report_data);
          }, (err) => {
            deferred.reject(err);
          })
        }, (err) => {
          deferred.reject(err);
        })
      return deferred.promise;
    }

    function buildIssueDetailData(issue, count) {
      const empty_data = [];
      let deferred = $q.defer();
      if (!issue || !count) {
        if (issue) {
          console.log("Ignore issue "+issue.name+" as its count is 0");
        }
        deferred.resolve(empty_data);
        return deferred.promise;
      }

      issueService.queryIssueDetail(issue)
        .then((issue_object) => {
          if (!issue_object.hasOptions()) {
            deferred.resolve(empty_data);
            return;
          }
          let options_list = optionService.convertOptionTreeToList(issue_object.options);
          let queryOptionInfoByIdPromisesDict = {};
          for (let i=0; i < options_list.length; i++) {
            let option = options_list[i];
            if (!option.isCalculable()) {
              continue;
            }
            let option_id = option.id;
            queryOptionInfoByIdPromisesDict[option_id] =
              reportService.queryOptionInfoById(option_id, $scope.date_range.start, $scope.date_range.end);
          }
          return $q.all(queryOptionInfoByIdPromisesDict);
        })
        .then((dict) => {
          docxService.buildIssueDetail(issue, count, dict)
            .then((result_data) => {
              deferred.resolve(result_data);
            }, (err) => {
              deferred.reject(err);
            })
        }, (err) => {
          deferred.reject(err);
        })
      return deferred.promise;
    }

    const REPORT_TEMP_FOLDER_PATH = path.resolve(__dirname, "assets/docs").replace('app.asar', '');
    $scope.isReportGenerating = false;
    $scope.onGenerateReport = function() {
      $scope.isReportGenerating = true;
      docxService.initReportDocx(REPORT_TEMP_FOLDER_PATH, $scope.date_range.start, $scope.date_range.end);
      let title_data = docxService.buildReportTitle([$scope.report_info.title, $scope.report_info.author]);
      docxService.appendReportContent(title_data);
      buildReportData()
        .then((content_data) => {
          docxService.appendReportContent(content_data);
          return docxService.generateReportDocx();
        })
        .then((file_path) => {
          let file_name = file_path.substring(file_path.lastIndexOf('/')+1);
          let downloadLink = angular.element('<a></a>');
          downloadLink.attr('href', file_path);
          downloadLink.attr('download', file_name);
			    downloadLink[0].click();

          $scope.isReportGenerating = true;
          $state.go('^.home');
        }, (err) => {
          console.error(err);
        })
    }

    $scope.onCancel = function() {
      $state.go('^.home');
    }
  }]);
