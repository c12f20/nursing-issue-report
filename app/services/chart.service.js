'use strict';

nirServices.factory('ChartService', ['$q',
  function($q) {
    const CHART_FILE_TEMP_FOLDER_PATH = path.resolve(__dirname, "assets/img");
    const CHART_BAR_COLORS = ['#c00000', '#7030a0', '#00b050', '#4f81bd', '#ffc000', '#00205a'];

    const CAPTION_PERCENT = "构成比%";
    function generatePercentChart(title, names_list, percent_list) {
      let deferred = $q.defer();
      if (!title || !names_list || names_list.length == 0
      || !percent_list || percent_list.length < names_list.length) {
        deferred.reject(new Error("Failed to generate percent chart file with invalid parameters"));
        return deferred.promise;
      }
      let legend_data = [];
      let series_data = [];
      let max_name_length = 0;
      for (let i=0; i < names_list.length; i++) {
        legend_data[i] = names_list[i].trim()+" "+percent_list[i]+"%";
        if (names_list[i].length > max_name_length) {
          max_name_length = names_list[i].length;
        }
        let series_item = {type: 'bar', name: legend_data[i], data: [percent_list[i]]};
        series_data[i] = series_item;
      }
      let grid_padding_right_percent = Math.round((max_name_length+5) * 2.5);
      grid_padding_right_percent = grid_padding_right_percent < 25 ? 25 : grid_padding_right_percent;
      let options = {
        color: CHART_BAR_COLORS,
        title: { text: title, left: 'center'},
        tooltip: {},
        legend: { type:'plain', orient: 'vertical', right: 10, top: 'center', data: legend_data},
        grid: {right: grid_padding_right_percent+"%"},
        xAxis: { data: [CAPTION_PERCENT]},
        yAxis: { type: 'value'},
        series: series_data,
      };
      title = title.replace(/[\/\\]/g, ""); // remove all "/" and "\"
      let filepath = CHART_FILE_TEMP_FOLDER_PATH+"/"+title+".png";
      let report_chart = remote.getGlobal('report_chart');
      report_chart.generateReportChart(options, filepath)
        .then((filepath) => {
          deferred.resolve(filepath);
        }, (err) => {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    return {
      generatePercentChart: generatePercentChart,
    };
  }]);
