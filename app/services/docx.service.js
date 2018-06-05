'use strict';

nirServices.factory('DocxService', ['$q', '$filter', 'ChartService',
  function($q, $filter, chartService) {
    const DEFAULT_FONT_FACE = "微软雅黑";
    const DEFAULT_REPORT_NAME = "不良事件分析报告";
    const CAPTION_TOTAL = "合计";
    const LINE_OPT_LEFT = {align: 'left'};
    const LINE_OPT_CENTER = {align: 'center'};
    let fout;
    let docx;
    let report_start_date, report_end_date;
    let report_data = [];
    let issue_index = 2; // as summary is 1, issues start from 2
    let option_index = 1;
    function __resetVariables() {
      fout = undefined;
      docx = undefined;
      report_start_date = undefined;
      report_end_date = undefined;
      report_data = [];

      issue_index = 2;
      option_index = 1;
    }

    function __deleteFiles(files_list) {
      for (let i=0; i < files_list.length; i++) {
        let delete_file = files_list[i];
        fs.unlink(delete_file, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log("Delele file: "+delete_file);
        })
      }
    }

    let chart_files = [];
    function __clearAllChartFiles() {
      __deleteFiles(chart_files);
      chart_files = [];
    }

    let report_files = [];
    function __clearAllReportFiles() {
      __deleteFiles(report_files);
      report_files = [];
    }

    function clearAll() {
      __resetVariables();
      __clearAllChartFiles();
      __clearAllReportFiles();
    }

    function initReportDocx(folder_path, start_date, end_date) {
      if (!folder_path || folder_path.length == 0
        || !start_date || !end_date) {
        console.error("Failed to init Report Docx with invalid parameters");
        return;
      }
      __clearAllReportFiles();
      let start_date_str = $filter('date')(start_date, 'yyyyMMdd');
      let end_date_str = $filter('date')(end_date, 'yyyyMMdd');
      let file_name = DEFAULT_REPORT_NAME+"("+start_date_str+"-"+end_date_str+").docx";
      let file_path = folder_path + "/" + file_name;
      docx = new officegen('docx');
      fout = fs.createWriteStream(file_path);
      report_start_date = start_date;
      report_end_date = end_date;
      return file_path;
    }

    function generateReportDocx() {
      let deferred = $q.defer();
      if (!fout || !docx) {
        deferred.reject(new Error("Failed to generate Report Docx without init"));
        return deferred.promise;
      }
      docx.createByJson(report_data);
      docx.generate(fout, {
        'finalize': (written) => {
          let file_path = fout.path;
          console.log('Finish to create a Word file. '+file_path);
          __resetVariables();
          __clearAllChartFiles();
          // add the file into report files list for later clear
          report_files.push(file_path);
          // As it's still in callback, we need set timeout to do save to ensure the file has generated completed.
          setTimeout(() => {
            deferred.resolve(file_path);
          }, 1000);
        },
        'error': (err) => {
          deferred.reject(err);
        }
      });
      return deferred.promise;
    }
    // Title
    const TITLE_OPTS = {font_face: DEFAULT_FONT_FACE, font_size: 12, bold: true};
    function addReportTitle(titles) {
      if (!titles || titles.length == 0) {
        console.warn("No titles input, this report is without titles");
        return;
      }
      for (let i=0; i < titles.length; i++) {
        let title = titles[i];
        report_data.push({type: 'text', val: title, opt: TITLE_OPTS, lopt: LINE_OPT_CENTER});
      }
    }
    // Issue summary table
    const CHART_NAME_TEMPLATE = "`图${chart_display_index}`";
    let chart_display_index = 1;
    function __buildChartName() {
      return eval(CHART_NAME_TEMPLATE);
      chart_display_index++;
    }

    function __buildIssueSummaryTable(departments_list, issues_list, department_issue_dict) {
      // Build table header
      const HEADER_OPTIONS = {cellColWidth: 4261, vAlign: "center"};
      let issue_summary_table_header = [{val: "", opts: HEADER_OPTIONS}];
      let issue_total_count_line = [CAPTION_TOTAL];
      for (let i=0; i < issues_list.length; i++) {
        let issue = issues_list[i];
        let header = {opts: HEADER_OPTIONS};
        header.val = issue.name;
        issue_summary_table_header.push(header);
        issue_total_count_line[i+1] = "0";
      }
      issue_summary_table_header.push({val: CAPTION_TOTAL, opts: HEADER_OPTIONS});
      // Build table content
      let issue_summary_table = [issue_summary_table_header];
      let issue_total_count = 0;
      for (let i=0; i < departments_list.length; i++) { // row
        let department = departments_list[i];
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
          department_issue_count_line[issues_list.length+1] = "0";
        } else {
          department_issue_count_line[issues_list.length+1] = department_total_issue_count;
        }
        issue_total_count += department_total_issue_count;
        issue_summary_table.push(department_issue_count_line);
      }
      issue_total_count_line[issues_list.length+1] = issue_total_count;
      issue_summary_table.push(issue_total_count_line);
      return issue_summary_table;
    }

    const CONTENT_OPTS = {font_face: DEFAULT_FONT_FACE, font_size: 12};
    const SUMMARY_TABLE_STYLE = {
      tableSize: 24,
      tableColor: "ada",
      tableAlign: "center",
      tableFontFamily: DEFAULT_FONT_FACE,
      borders: true,
    };

    const TEXT_SUMMARY = "`自${state_date_text}到${end_date_text}，我院各护理部门共上报${total_count}例不良事件，现将不良事件的情况分别汇总分析如下：`";
    const TITLE_SUMMARY = "一、 护理不良事件：";
    const TITLE_SUMMARY_TABLE = "（一） 各护理部门不良事件汇总表：";
    const TITLE_SUMMARY_CHART = "（二）	全院不良事件构成比：";
    const TEXT_SUMMARY_CHART = "`全院不良事件发生数和构成比例如${chart_name}。${chart_name}显示，`";
    const TEXT_SUMMARY_CHART_ISSUE = "`${issue_name}发生${issue_count}例，构成比为${issue_percent}%`";
    const SUMMARY_CHART_TITLE = "全院不良事件构成比";
    function addIssueSummary(departments_list, issues_list, department_issue_dict) {
      let deferred = $q.defer();
      if (!departments_list || departments_list.length == 0
      || !issues_list || issues_list.length == 0
      || !department_issue_dict || department_issue_dict.length == 0) {
        deferred.reject(new Error("Failed to add Issue Summary with invalid parameters"));
        return deferred.promise;;
      }
      let summary_table = __buildIssueSummaryTable(departments_list, issues_list, department_issue_dict);
      let total_count = summary_table[departments_list.length+1][issues_list.length+1];
      let state_date_text = report_start_date.toLocaleDateString('zh-CN');
      let end_date_text = report_end_date.toLocaleDateString('zh-CN');
      // Summary content
      report_data.push({type:'text', val: eval(TEXT_SUMMARY), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      report_data.push({type:'text', val: TITLE_SUMMARY, opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      // Summary Table content
      report_data.push({type:'text', val: TITLE_SUMMARY_TABLE, opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      report_data.push({type:'table', val: summary_table, opt: SUMMARY_TABLE_STYLE})
      // Summary Chart content
      let chart_name = __buildChartName();
      let text_summary_chart = eval(TEXT_SUMMARY_CHART);
      let issue_name_list = [];
      let issue_percent_list = [];
      let issue_count_dict = {};
      for (let i=0; i < issues_list.length; i++) {
        let issue_name = issues_list[i].name;
        let issue_count = summary_table[departments_list.length+1][i+1];
        let issue_percent = Math.round(issue_count*1000/total_count)/10;
        let issue_text = eval(TEXT_SUMMARY_CHART_ISSUE);
        text_summary_chart += issue_text;
        if (i == issues_list.length-1) {
          text_summary_chart += "。";
        } else {
          text_summary_chart += "；";
        }
        // build data for chart
        issue_name_list[i] = issue_name;
        issue_percent_list[i] = issue_percent;
        // build data for issue detail data
        issue_count_dict[issues_list[i].id] = issue_count;
      }
      report_data.push({type: 'text', val: text_summary_chart, opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      // Summary Chart
      let chart_title = SUMMARY_CHART_NAME + "：" + SUMMARY_CHART_TITLE;
      chartService.generatePercentChart(chart_title, issue_name_list, issue_percent_list)
        .then((png_path) => {
          chart_files.push(png_path);
          report_data.push({type: 'image', path: png_path});
          deferred.resolve(issue_count_dict);
        }, (err) => {
          deferred.reject(err);
        })
      return deferred.promise;
    }

    const TITLE_ISSUE_SUMMARY = "`${issue_display_index}、 不良事件--${issue_name}：`";
    const TEXT_ISSUE_SUMMARY = "共发生${issue_name}事件${issue_count}例，现将事件的资料分析如下：";
    function addIssueDetail(issue, count, option_vallist_dict) {
      let deferred = $q.defer();
      if (!issue || !count || !option_vallist_dict || option_vallist_dict.length == 0) {
        deferred.reject(new Error("Failed to add Issue Detail with invalid parameters"));
        return deferred.promise;
      }
      // Title
      let issue_name = issue.name;
      let issue_display_index = Utils.numberToZhUppercase(issue_index);
      report_data.push({type:'text', val: eval(TITLE_ISSUE_SUMMARY), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      issue_index++;
      // Summary
      let issue_count = count;
      report_data.push({type:'text', val: eval(TEXT_ISSUE_SUMMARY), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      // Option List
      option_display_index = 1; // reset option index
      let options_list = optionService.convertOptionTreeToList(issue.options);
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        let values_dict = option_vallist_dict[option.id];
        __addOptionDetail(issue_name, option, values_dict);
      }
      return deferred.promise;
    }
    const TITLE_OPTION_WITHOUTCHART = "`（${option_display_index}）${option_name}：`";
    const TITLE_OPTION_WITHCHART = "`（${option_display_index}）${option_name}：对${issue_name}影响列于${chart_name}。`";
    function __addOptionDetail(issue_name, option, values_dict) {
      let option_display_index = Utils.numberToZhUppercase(option_index);
      let option_name = option.name;
      if (option.hasChildren()) {
        report_data.push({type:'text', val: eval(TITLE_OPTION_WITHOUTCHART), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
        return;
      } else {
        let chart_name = __buildChartName();
        report_data.push({type:'text', val: eval(TITLE_OPTION_WITHCHART), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      }
    }

    return {
      initReportDocx: initReportDocx,
      generateReportDocx: generateReportDocx,
      addReportTitle: addReportTitle,
      addIssueSummary: addIssueSummary,
      addIssueDetail: addIssueDetail,
      clearReportDocx: clearAll,
    }
  }]);
