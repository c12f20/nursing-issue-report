'use strict';

nirServices.factory('DocxService', ['$q', '$filter',
  function($q, $filter) {
    const DEFAULT_REPORT_NAME = $filter('translate')('DEFAULT_REPORT_NAME');
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
          __clearAll();
          deferred.resolve();
        },
        'error': (err) => {
          deferred.reject(err);
        }
      });
      return deferred.promise;
    }

    function addIssueSummary(departments_list, issues_list, department_issue_dict) {
      if (!departments_list || departments_list.length == 0
      || !issue_list || issue_list.length == 0
      || !department_issue_dict || department_issue_dict.length == 0) {
        console.error("Failed to add Issue Summary with invalid parameters");
        return;
      }
      // Build table header
      const HEADER_OPTIONS = {cellColWidth: 4261, vAlign: "center"};
      let issue_summary_table_header = [{val: "", opts: HEADER_OPTIONS}];
      let issue_total_count_line = [$filter('translate')('CAPTION_TOTAL')];
      for (let i=0; i < issues_list.length; i++) {
        let issue = issues_list[0];
        let header = {opts: HEADER_OPTIONS};
        header.val = issue.name;
        issue_summary_table_header.push(header);
        issue_total_count_line[i] = "0";
      }
      issue_summary_table_header.push({val: $filter('translate')('CAPTION_TOTAL'), opts: HEADER_OPTIONS});
      // Build table content
      let issue_summary_table = [issue_summary_table_header];
      let issue_total_count = 0;
      for (let i=0; i < departments_list.length; i++) { // row
        let department = department_list[i];
        let issue_dict = department_issue_dict[department.id];
        if (!issue_dict) {
          issue_dict = {};
        }
        let department_issue_count_line = [department.name];
        let department_total_issue_count = 0;
        for (let j=0; j < issues_list.length; j++) { // column
          let issue = issues_list[j];
          let issue_count = issue_dict[issue.id];
          if (issue_count) {
            department_issue_count_line[j+1] = issue_count;
            if (issue_total_count_line[j+1] == "0") { // first valid count
              issue_total_count_line[j+1] = issue_count;
            } else {
              issue_total_count_line[j+1] += issue_count;
            }
            department_total_issue_count += issue_count;
          } else {
            department_issue_count_line[j+1] = "0";
          }
        }
        if (department_total_issue_count == 0) {
          department_issue_count_line[issues_list.length] = "0";
        } else {
          department_issue_count_line[issues_list.length] = department_total_issue_count;
        }
        issue_total_count += department_total_issue_count;
        issue_summary_table.push(department_issue_count_line);
      }
      issue_summary_table.push(issue_total_count_line);
    }

    return {
      initReportDocx: initReportDocx,
      generateReportDocx: generateReportDocx,
    }
  }]);
