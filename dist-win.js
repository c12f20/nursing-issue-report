'use strict';

const electronInstaller = require('electron-winstaller');

electronInstaller.createWindowsInstaller({
    appDirectory: './build/NursingIssueReporter-win32-x64',
    outputDirectory: './dist/installer64',
    authors: 'Hill.Cen',
  }).then(() => {
    console.log("Windows Installer created successfully.");
  }, (err) => {
    console.error(`Failed to create Windows Installer, error: ${err.message}`);
  })
