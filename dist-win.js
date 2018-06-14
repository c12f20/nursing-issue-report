'use strict';

const electronInstaller = require('electron-winstaller');
const path = require('path');

const args = process.argv.splice(2);
const arch = args[0]

electronInstaller.createWindowsInstaller({
    appDirectory: path.resolve(__dirname, `build/NIR-win32-${arch}`),
    outputDirectory: path.resolve(__dirname, `dist/installer-${arch}`),
    authors: 'hill.cen',
    exe: "NIR.exe",
    description: "护理不良事件报告工具",
    setupExe: "NIRSetup.exe",
    loadingGif: path.resolve(__dirname, "app/assets/img/loading.gif"),
    noMsi: true
  }).then(() => {
    console.log("Windows Installer created successfully.");
  }, (err) => {
    console.error(`Failed to create Windows Installer, error: ${err.message}`);
  })
