'use strict';

const builder = require('electron-builder');
const path = require('path');

const args = process.argv.splice(2);
const arch = args[0]

builder.build({
  config: {
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory" : true
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": [
            arch
          ]
        }
      ]
    },
    "extraResources": [
      "app/assets/img",
      "app/assets/docs",
      "app/assets/db/core.db"
    ],
    "directories": {
      "output": `../dist/dist-${arch}`
    }
  }
}).then(() => {
  console.log("Windows Installer created successfully.");
}, (err) => {
  console.error(`Failed to create Windows Installer, error: ${err.message}`);
})
