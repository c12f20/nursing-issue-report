'use strict';

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

nirServices.factory('DbService', function() {
  const DB_PATH = 'app/assets/db/core.db';
  const DB_VERSION_INVALID = -1;
  const DB_VERSION_CURRENT = 1;
  // Construct database
  var db = null;
  function __createDatabase() {
    db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
        return;
      }
      console.log("createDatabase: Connect to database successfully");
      db.serialize(() => {
        db.run(`CREATE TABLE tblVersion (
            value integer NOT NULL)`) // Table Version
          .run(`CREATE TABLE tblDepartment (
            id integer PRIMARY KEY,
            name text NOT NULL)`) // Table Department
          .run(`CREATE TABLE tblIssue (
            id integer PRIMARY KEY,
            name text NOT NULL)`) // Table Issue
          .run(`CREATE TABLE tblOption (
            id integer PRIMARY KEY,
            issue_id integer NOT NULL,
            name text NOT NULL,
            option_values text NOT NULL,
            FOREIGN KEY(issue_id) REFERENCES tblIssue (id)
            ON DELETE CASCADE ON UPDATE NO ACTION)`) // Table Option
          .run(`CREATE TABLE tblReport (
            id integer PRIMARY KEY,
            department_id integer NOT NULL,
            issue_id integer NOT NULL,
            creation_time integer NOT NULL,
            FOREIGN KEY(department_id) REFERENCES tblDepartment (id)
            ON DELETE CASCADE ON UPDATE NO ACTION,
            FOREIGN KEY(issue_id) REFERENCES tblIssue (id)
            ON DELETE CASCADE ON UPDATE NO ACTION)`) // Table Report
          .run(`CREATE TABLE tblReportDetail (
            id integer PRIMARY KEY,
            report_id integer NOT NULL,
            option_id integer NOT NULL,
            option_value text NOT NULL,
            FOREIGN KEY(report_id) REFERENCES tblReport (id)
            ON DELETE CASCADE ON UPDATE NO ACTION,
            FOREIGN KEY(option_id) REFERENCES tblOption (id)
            ON DELETE CASCADE ON UPDATE NO ACTION)`) // Table ReportDetail
          .run(`INSERT INTO tblVersion (value)
            VALUES (${DB_VERSION_CURRENT})`)
      })
    });
  }

  function __alertDatabase(db_version) {
    if (db_version === DB_VERSION_CURRENT) {
      return;
    }
    // todo: now always create a new database, I'll add database alert process for different versions later
    __closeDatabase().then(() => {
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
      }
      __createDatabase();
    }, (err) => {
      console.error(err.message);
    });
  }

  function __getDatabaseVersion() {
    return new Promise((resolve, reject) => {
      let version = DB_VERSION_INVALID;
      db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          db = null;
          reject(err);
          return;
        }
        console.log("getDatabaseVersion: Connect to database successfully");
        db.get('SELECT value FROM tblVersion', [], (err, row) => {
          if (err) {
            db = null;
            reject(err);
            return;
          }
          version = parseInt(row.value);
          resolve(version);
        })
      });
    });
  }

  function __closeDatabase() {
    return new Promise((resolve, reject) => {
      if (!db) {
        resolve();
        return;
      }
      db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        db = null;
        console.log("Close database successfully");
        resolve();
      });
    });
  }

  function init() {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
        return;
      }
      __getDatabaseVersion().then((db_version) => {
        console.log(`Current Database version ${db_version}`);
        __alertDatabase(db_version);
        resolve(db);
      }, (err) => {
        console.warn(err.message);
        __alertDatabase(DB_VERSION_INVALID);
        resolve(db);
      });
    })
  }

  // Destroy Database
  function destroy() {
    __closeDatabase();
  }
  
  return {
    create: init,
    destroy: destroy
  };
})
