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
            type integer NOT NULL,
            option_values text,
            FOREIGN KEY(issue_id) REFERENCES tblIssue (id)
            ON DELETE CASCADE ON UPDATE NO ACTION)`) // Table Option
          .run(`CREATE TABLE tblReport (
            id integer PRIMARY KEY,
            department_id integer NOT NULL,
            issue_id integer NOT NULL,
            creation_time integer NOT NULL,
            data text,
            FOREIGN KEY(department_id) REFERENCES tblDepartment (id)
            ON DELETE CASCADE ON UPDATE NO ACTION,
            FOREIGN KEY(issue_id) REFERENCES tblIssue (id)
            ON DELETE CASCADE ON UPDATE NO ACTION)`) // Table Report
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
    __getDatabaseVersion().then((db_version) => {
      console.log(`Current Database version ${db_version}`);
      __alertDatabase(db_version);
    }, (err) => {
      console.warn(err.message);
      __alertDatabase(DB_VERSION_INVALID);
    });
  }

  // Destroy Database
  function destroy() {
    __closeDatabase();
  }

  // Report related methods
  function addReport(department_id, issue_object) {
    return new Promise((resolve, reject) => {
      if (!department_id || !issue_object
      || !(issue_object instanceof Issue)) {
        reject(new Error("Failed to add report with invalid parameters"));
        return;
      }
      if (!db) {
        reject(new Error("Failed to add report as database isn't ready"));
        return;
      }
      db.run(`INSERT INTO tblReport (department_id, issue_id, creation_time, data)
        VALUES (${department_id}, ${issue_object.issue_id}, ${issue_object.creation_time}, ${issue_object.option_values})`,
        (err) => {
          if (err) {
            reject(new Error(`Failed to add report, error: ${err.message}`));
            return;
          }
          resolve();
        });
    });
  }

  function removeReport(report_id) {
    return new Promise((resolve, reject) => {
      if (!report_id) {
        reject(new Error("Failed to remove report with invalid report id"));
        return;
      }
      if (!db) {
        reject(new Error("Failed to remove report as database isn't ready"));
        return;
      }

      db.run(`DELETE FROM tblReport where id = ${report_id}`,
        (err) => {
          if (err) {
            reject(new Error(`Failed to remove report ${report_id}, error: ${err.message}`));
            return;
          }
          resolve();
        });
    });
  }

  function updateReport(report_id, department_id, issue_object) {
    return new Promise((resolve, reject) => {
      if (!report_id || !department_id
      || !issue_object || !(issue_object instanceof Issue)) {
        reject(new Error("Failed to update report with invalid parameters"));
        return;
      }
      if (!db) {
        reject(new Error("Failed to update report as database isn't ready"));
        return;
      }

      db.run(`UPDATE tblReport SET
        department_id = ${department_id},
        issue_id = ${issue_object.issue_id},
        creation_time = ${issue_object.creation_time},
        data = ${issue_object.option_values}
        WHERE id = ${report_id}`,
        (err) => {
          if (err) {
            reject(new Error(`Failed to update report ${report_id}, error: ${err.message}`));
            return;
          }
          resolve();
        });
    });
  }

  // Execute initilization with Service construction
  init();

  return {
    addReport: addReport,
    removeReport: removeReport,
    onDestroy: destroy
  };
})
