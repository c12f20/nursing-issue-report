'use strict'

const Canvas = require('canvas');
const echarts = require('echarts');
const fs = require('fs');

const CHART_DEFAULT_SIZE = {width: 600, height: 300};

function generateReportChart(options, filepath) {
  return new Promise((resolve, reject) => {
    if (!options || !filepath) {
      reject(new Error("Failed to generate chart file with invalid parameters"));
      return;
    }
    const canvas = new Canvas(CHART_DEFAULT_SIZE.width, CHART_DEFAULT_SIZE.height);
    echarts.setCanvasCreator(() => {
      return canvas;
    });
    const chart = echarts.init(canvas);
    options.animation = false;
    chart.setOption(options);
    fs.writeFile(filepath, chart.getDom().toBuffer(), (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(filepath);
    });
  });
}

module.exports = {
  generateReportChart: generateReportChart,
}
