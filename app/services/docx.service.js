'use strict';

nirServices.factory('DocxService', ['$q', '$filter', 'ChartService', 'OptionService',
  function($q, $filter, chartService, optionService) {
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
      chart_index = 1;
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

    function appendReportContent(content_data) {
      if (!content_data || content_data.length == 0) {
        console.warn("Empty report data, ignore it");
        return;
      }
      report_data = report_data.concat(content_data);
    }
    // Title
    const TITLE_OPTS = {font_face: DEFAULT_FONT_FACE, font_size: 12, bold: true};
    function buildReportTitle(titles) {
      let result_data = [];
      if (!titles || titles.length == 0) {
        console.warn("No titles input, this report is without titles");
        return result_data;
      }
      for (let i=0; i < titles.length; i++) {
        let title = titles[i];
        result_data.push({type: 'text', val: title, opt: TITLE_OPTS, lopt: LINE_OPT_CENTER});
      }
      return result_data;
    }
    // Issue summary table
    const CHART_NAME_TEMPLATE = "`图${chart_index}`";
    let chart_index = 1;
    function __buildChartName() {
      let chart_name = eval(CHART_NAME_TEMPLATE);
      chart_index++;
      return chart_name;
    }

    function __buildIssueSummaryTable(departments_list, issues_list, department_issue_dict) {
      // Build table header
      const HEADER_OPTIONS = {cellColWidth: 50, vAlign: "center"};
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
      if (issue_total_count == 0) {
        issue_total_count_line[issues_list.length+1] = "0";
      } else {
        issue_total_count_line[issues_list.length+1] = issue_total_count;
      }
      issue_summary_table.push(issue_total_count_line);
      return issue_summary_table;
    }

    const CONTENT_OPTS = {font_face: DEFAULT_FONT_FACE, font_size: 10};
    const CHART_OPTS = {cx: 576, cy: 288};
    const SUMMARY_TABLE_STYLE = {
      sz: 20,
      tableColWidth: 4261,
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
    function buildIssueSummary(departments_list, issues_list, department_issue_dict) {
      let deferred = $q.defer();
      if (!departments_list || departments_list.length == 0
      || !issues_list || issues_list.length == 0
      || !department_issue_dict || Object.keys(department_issue_dict).length == 0) {
        deferred.reject(new Error("Failed to add Issue Summary with invalid parameters"));
        return deferred.promise;;
      }
      let result_data = [];
      let summary_table = __buildIssueSummaryTable(departments_list, issues_list, department_issue_dict);
      let total_count = summary_table[departments_list.length+1][issues_list.length+1];
      let state_date_text = report_start_date.toLocaleDateString('zh-CN');
      let end_date_text = report_end_date.toLocaleDateString('zh-CN');
      // Summary content
      result_data.push({type:'text', val: eval(TEXT_SUMMARY), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      result_data.push({type:'text', val: TITLE_SUMMARY, opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      // Summary Table content
      result_data.push({type:'text', val: TITLE_SUMMARY_TABLE, opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      result_data.push({type:'table', val: summary_table, opt: SUMMARY_TABLE_STYLE})
      // Summary Chart content
      let issue_count_dict = {};
      if (total_count == 0) { // No Summary Chart content when there is no issue at all
        for (let i=0; i < issues_list.length; i++) {
          let issue_count = summary_table[departments_list.length+1][i+1];
          issue_count_dict[issues_list[i].id] = issue_count;
        }
        deferred.resolve({'data': result_data, 'dict': issue_count_dict});
        return deferred.promise;
      }
      let chart_name = __buildChartName();
      let text_summary_chart = eval(TEXT_SUMMARY_CHART);
      let issue_name_list = [];
      let issue_percent_list = [];
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
      result_data.push({type: 'text', val: text_summary_chart, opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      // Summary Chart
      let chart_title = chart_name + "：" + SUMMARY_CHART_TITLE;
      chartService.generatePercentChart(chart_title, issue_name_list, issue_percent_list)
        .then((png_path) => {
          chart_files.push(png_path);
          result_data.push({type: 'image', path: png_path, opt: CHART_OPTS});
          deferred.resolve({'data': result_data, 'dict': issue_count_dict});
        }, (err) => {
          deferred.reject(err);
        })
      return deferred.promise;
    }

    const TITLE_ISSUE_SUMMARY = "`${issue_display_index}、 不良事件--${issue_name}：`";
    const TEXT_ISSUE_SUMMARY = "`共发生${issue_name}事件${issue_count}例，现将事件的资料分析如下：`";
    function buildIssueDetail(issue, count, option_vallist_dict) {
      let deferred = $q.defer();
      if (!issue || !count || !option_vallist_dict || Object.keys(option_vallist_dict).length == 0) {
        deferred.reject(new Error("Failed to add Issue Detail with invalid parameters"));
        return deferred.promise;
      }
      let result_data = [];
      // Title
      let issue_name = issue.name;
      let issue_display_index = Utils.numberToZhUppercase(issue_index);
      result_data.push({type:'text', val: eval(TITLE_ISSUE_SUMMARY), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      issue_index++;
      // Summary
      let issue_count = count;
      result_data.push({type:'text', val: eval(TEXT_ISSUE_SUMMARY), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      // Option List
      option_index = 1; // reset option index
      let options_list = optionService.convertOptionTreeToList(issue.options);
      let addOptionPromises = [];
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        let values_dict = option_vallist_dict[option.id];
        addOptionPromises.push(__buildOptionDetail(issue_name, option, values_dict));
      }
      $q.all(addOptionPromises)
        .then((options_data) => {
          for(let i=0; i < options_data.length; i++) {
            result_data = result_data.concat(options_data[i]);
          }
          deferred.resolve(result_data);
        }, (err) => {
          deferred.reject(err);
        })
      return deferred.promise;
    }
    const TITLE_OPTION_WITHOUTCHART = "`（${option_display_index}）${option_name}：`";
    const TITLE_OPTION_WITHCHART = "`（${option_display_index}）${option_name}：对${issue_name}影响列于${chart_name}。`";
    const TITLE_SUBOPTION_WITHCHART = "`${suboption_index}、${option_name}：对${issue_name}影响列于${chart_name}。`";
    const TEXT_OPTION_CHART_SUMMARY = "`${chart_name}显示，`"
    const TEXT_OPTION_CHART_VALUE = "`${value_name}发生${value_count}例，构成比为${value_percent}%`";
    const OPTION_CHART_TITLE = "`${option_name}对${issue_name}影响构成比`"
    function __buildOptionDetail(issue_name, option, values_dict) {
      let deferred = $q.defer();
      let option_display_index = Utils.numberToZhUppercase(option_index);
      let option_name = option.name;
      let result_data = [];
      if (!option.isCalculable()) { // Non-Calculable 1st level option
        result_data.push({type:'text', val: eval(TITLE_OPTION_WITHOUTCHART), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
        option_index++;
        deferred.resolve(result_data);
        return deferred.promise;
      }
      let chart_name = __buildChartName();
      if (!option.isChild()) { // Calculable 1st level option
        result_data.push({type:'text', val: eval(TITLE_OPTION_WITHCHART), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
        option_index++;
      } else { // Calculable child level option
        let suboption_index = option.index;
        result_data.push({type:'text', val: eval(TITLE_SUBOPTION_WITHCHART), opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      }
      let values_value_list = Object.values(values_dict);
      // Calculate total count
      let total_count = 0;
      for (let i=0; i < values_value_list.length; i++) {
        total_count += values_value_list[i];
      }
      // Build Chart Summary content
      let values_keys_list = Object.keys(values_dict);
      let values_name_list = [];
      let values_percent_list = [];
      let text_summary_chart = eval(TEXT_OPTION_CHART_SUMMARY);
      for (let i=0; i < values_keys_list.length; i++) {
        let value_name = values_keys_list[i];
        let value_count = values_dict[value_name];
        if (!isNaN(value_name)) {
          value_name += "分";
        }
        let value_percent = Math.round(value_count*1000/total_count)/10;
        let value_text = eval(TEXT_OPTION_CHART_VALUE);
        text_summary_chart += value_text;
        if (i == values_keys_list.length-1) {
          text_summary_chart += "。";
        } else {
          text_summary_chart += "；";
        }
        // build data for chart
        values_name_list[i] = value_name;
        values_percent_list[i] = value_percent;
      }
      result_data.push({type:'text', val: text_summary_chart, opt: CONTENT_OPTS, lopt: LINE_OPT_LEFT});
      // Summary Chart
      let chart_title = chart_name + "：" + eval(OPTION_CHART_TITLE);
      chart_title = chart_title.replace(/[\n]/g, ""); // remove all "\n"
      chartService.generatePercentChart(chart_title, values_name_list, values_percent_list)
        .then((png_path) => {
          chart_files.push(png_path);
          result_data.push({type: 'image', path: png_path, opt: CHART_OPTS});
          deferred.resolve(result_data);
        }, (err) => {
          deferred.reject(err);
        })
      return deferred.promise;
    }

    return {
      initReportDocx: initReportDocx,
      generateReportDocx: generateReportDocx,
      appendReportContent: appendReportContent,
      buildReportTitle: buildReportTitle,
      buildIssueSummary: buildIssueSummary,
      buildIssueDetail: buildIssueDetail,
      clearReportDocx: clearAll,
    }
  }]);
