'use strict';

nirServices.factory('DocxService', ['$q',
  function($q) {
    const DEFAULT_REPORT_NAME = "不良事件分析报告";
    let fout;
    let docx;
    let report_start_date, report_end_date;
    function __clearAll() {
      fout = undefined;
      docx = undefined;
      report_start_date = undefined;
      report_end_date = undefined;
    }

    function initReportDocx(folder_path, start_date, end_date) {
      if (!folder_path || folder_path.length == 0
        || !start_date || !end_date) {
        console.error("Failed to init Report Docx with invalid parameters");
        return;
      }
      let file_name = DEFAULT_REPORT_NAME+"("
        +start_date.toLocaleDateString('zh-CN')+" - "
        +end_date.toLocaleDateString('zh-CN');
      let file_path = folder_path + "/" + file_name;
      docx = new officegen('docx');
      fout = fs.createWriteStream(file_path);
      report_start_date = start_date;
      report_end_date = end_date;
    }

    function generateReportDocx() {
      let deferred = $q.defer();
      if (!fout || !docx) {
        deferred.reject(new Error("Failed to generate Report Docx without init"));
        return deferred.promise;
      }
      docx.generate(fout, {
        'finalize': (written) => {
          console.log('Finish to create a Word file.\nTotal bytes created: ' + written + '\n');
          deferred.resolve();
        },
        'error': (err) => {
          deferred.reject(err);
        }
      });
      return deferred.promise;
    }

    function addIssueSummary(departments_list, issues_list, department_issue_list) {

    }

    return {
      initReportDocx: initReportDocx,
      generateReportDocx: generateReportDocx,
    }
  }]);
