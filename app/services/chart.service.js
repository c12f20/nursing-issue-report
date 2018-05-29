'use strict';

nirServices.factory('ChartService', ['$q',
  function($q) {
    const CHART_FILE_ROOT_PATH = "app/assets/img";
    const CHART_BAR_COLORS = ['#c00000', '#7030a0', '#00b050', '#4f81bd', '#ffc000', '#00205a'];
    const CHART_DEFAULT_SIZE = {width: 480, height: 240};

    function __generateChartFile(deferred, option, filepath) {
      if (!option || !filepath) {
        deferred.reject(new Error("Failed to generate chart file with invalid parameters"));
        return deferred.promise;
      }
      const canvas = new Canvas(CHART_DEFAULT_SIZE.width, CHART_DEFAULT_SIZE.height);
      echarts.setCanvasCreator(() => {
        return canvas;
      });
      const chart = echarts.init(canvas);
      options.animation = false;
      chart.setOption(options);
      try {
        fs.writeFileSync(filepath, chart.getDom().toBuffer());
        deferred.resolve(filepath);
      } catch (err){
        deferred.reject(err);
      }
      return deferred.promise;
    }

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
      for (let i=0; i < names_list.length; i++) {
        legend_data[i] = names_list[i]+percent_list[i];
        let series_item = {type: 'bar', name: legend_data[i], data: percent_list[i]};
        series_data[i] = series_item;
      }
      let options = {
        color: CHART_BAR_COLORS,
        title: { text: title },
        tooltip: {},
        legend: { type:'plain', orient: 'vertical', right: 10, top: 20, bottom: 20, data: legend_data},
        grid: {right: '20%'},
        xAxis: { data: [CAPTION_PERCENT]},
        yAxis: { type: 'value'},
        series: series_data,
      };
      let filepath = CHART_FILE_ROOT_PATH+"/"+title+".png";
      return __generateChartFile(deferred, options, filepath);
    }

    return {
      generatePercentChart: generatePercentChart,
    };
  }]);
