'use strict';

nirServices.factory('ReportService', ['DBService',
  function(dbService){
    let db = null;
    function init() {
      dbService.init().then((db_handle) => {
        db = db_handle;
      }, (err) => {
        console.error(`ReportService: failed to get DB Handle, error: ${err.message}`);
        db = null;
      })
    }
    init();

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

    function updateReport(report_object) {
      return new Promise((resolve, reject) => {
        if (!report_object || !report_object.id || !report_object.department_id
        || !report_object.issue || !(report_object.issue instanceof Issue)) {
          reject(new Error("Failed to update report with invalid parameters"));
          return;
        }
        if (!db) {
          reject(new Error("Failed to update report as database isn't ready"));
          return;
        }
        let issue_object = report_object.issue;
        db.run(`UPDATE tblReport SET
          department_id = ${report_object.department_id},
          issue_id = ${issue_object.issue_id},
          creation_time = ${report_object.creation_time},
          data = ${issue_object.option_values}
          WHERE id = ${report_object.id}`,
          (err) => {
            if (err) {
              reject(new Error(`Failed to update report ${report_id}, error: ${err.message}`));
              return;
            }
            resolve();
          });
      });
    }

    function queryAllReports(offset, count) {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error("Failed to query all reports as database isn't ready"));
          return;
        }
        offset = offset ? offset : 0;
        let sql = `SELECT `
        if (count) {

        }

      });
    }

    return {
      addReport: addReport,
      deleteReport: deleteReport,
      updateReport: updateReport
    }
  }]);
