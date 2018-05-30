const sqlite3 = require('sqlite3').verbose();
const TransactionDatabase = require('sqlite3-transactions').TransactionDatabase;
const fs = require('fs');
const path = require('path');
const officegen = require('officegen');
const remote = require('electron').remote;
