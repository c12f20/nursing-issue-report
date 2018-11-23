const electron = require('electron');
// Module to control application life.
const app = electron.app;
const Menu = electron.Menu;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// For Report Chart API
global.report_chart = require('./modules/report_chart.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1054, height: 828});

  mainWindow.setResizable(false);
  //mainWindow.setMaximizable(false);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/app/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  // Setup menu
  const template = [
    {
      label: '文件',
      submenu: [
        {label: '导出数据库...', click() {exportDatabase();}},
        {label: '导入数据库...', click() {importDatabase();}},
        {type: 'separator'},
        {label: '退出', role: 'quit'}
      ]
    },
    {
      label: "帮助",
      role: 'help',
      submenu: [
        {label: '关于', click() {showAbout();}}
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.setName("护理不良事件报告工具");
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const dialog = electron.dialog;
const package = require("./package.json");
const fs = require("fs");
function showAbout() {
  dialog.showMessageBox({type: "none", title: "关于", message: "护理不良事件报告工具", detail: "版本 v"+package.version});
}

const db_name = "core.db";
const db_path = path.resolve(__dirname, 'app/assets/db/'+db_name).replace('app.asar', '');
function exportDatabase() {
  let dialog_options = {title: "导出数据库",
                        defaultPath: db_name,
                        filters: [{name: "数据库文件", extensions: ['db']}]};
  dialog.showSaveDialog(dialog_options, (dest_db_path) => {
    if (!dest_db_path) {
      return;
    }
    console.log("Export database into "+dest_db_path);
    fs.createReadStream(db_path).pipe(fs.createWriteStream(dest_db_path));
  });
}

function importDatabase() {
  let dialog_options = {title: "导入数据库",
                        filters: [{name: "数据库文件", extensions: ['db']}]};
  dialog.showOpenDialog(dialog_options, (paths) => {
    if (!paths || paths.length != 1) {
      return;
    }
    const src_db_path = paths[0];
    console.log("Import database from "+src_db_path);
    fs.createReadStream(src_db_path).pipe(fs.createWriteStream(db_path));
  })
}
