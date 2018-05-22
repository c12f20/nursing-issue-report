'use strict';

nirServices.factory('ReportService', ['$q', 'DbService',
  function($q, dbService) {
    let db = undefined;
    function __init() {
      let deferred = $q.defer();
      dbService.create().then((db_handle) => {
        deferred.resolve(db_handle);
      }, (err) => {
        deferred.reject(new Error(`ReportService: failed to get DB Handle, error: ${err.message}`));
      })
      return deferred.promise;
    }

    // Report related methods
    function addReport(department_id, issue_id, creation_time) {
      let deferred = $q.defer();
      if (!department_id || !issue_id
      || !creation_time || !(creation_time instanceof Date)) {
        deferred.reject(new Error("Failed to add report with invalid parameters"));
        return deferred.promise;
      }
      __init().then((db) => {
        let creation_timestamp = creation_time.getTime()/1000;
        db.run(`INSERT INTO tblReport (department_id, issue_id, creation_time)
          VALUES (${department_id}, ${issue_id}, ${creation_timestamp})`,
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to add report, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function removeReport(report_id) {
      let deferred = $q.defer();
      if (!report_id) {
        deferred.reject(new Error("Failed to remove report with invalid report id"));
        return deferred.promise;
      }
      __init().then((db) => {
        db.run(`DELETE FROM tblReport where id = ${report_id}`,
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to remove report ${report_id}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function updateReport(report_object) {
      let deferred = $q.defer();
      if (!report_object || !report_object.id
      || !report_object.department_object || !(report_object.department_object instanceof Department)
      || !report_object.issue || !(report_object.issue instanceof Issue)
      || !report_object.creation_time || !(report_object.creation_time instanceof Date)) {
        deferred.reject(new Error("Failed to update report with invalid parameters"));
        return deferred.promise;
      }
      __init().then((db) => {
        let department_object = report_object.department_object;
        let issue_object = report_object.issue;
        let creation_timestamp = report_object.creation_time.getTime()/1000;
        db.run(`UPDATE tblReport SET
          department_id = ${department_object.id},
          issue_id = ${issue_object.id},
          creation_time = ${creation_timestamp},
          WHERE id = ${report_object.id}`,
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to update report ${report_object.id}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      })
      return deferred.promise;
    }

    function queryReportsMinCreationTime() {
      let deferred = $q.defer();
      __init().then((db) => {
        let sql = "SELECT min(creation_time) min_creation_time FROM tblReport";
        db.get(sql, [], (err, row) => {
          if (err) {
            deferred.reject(new Error(`Failed to query minimum creation time of all reports, error: ${err.message}`));
            return;
          }
          deferred.resolve(row.min_creation_time);
        })
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function buildQueryWhereClause(start_date, end_date) {
      let where_clause = ""
      if (start_date || end_date) {
        where_clause = "WHERE";
        if (start_date) {
          where_clause += " tblReport.creation_time >= " +Math.round(start_date.getTime()/1000);
        }
        if (end_date) {
          if (start_date) {
            where_clause += " and";
          }
          where_clause += " tblReport.creation_time <= "+Math.round(end_date.getTime()/1000);
        }
      }
      return where_clause;
    }

    function queryReportsCountInDataRange(start_date, end_date) {
      let deferred = $q.defer();
      __init().then((db) => {
        let where_clause = buildQueryWhereClause(start_date, end_date);

        let sql = `SELECT count(id) total_count FROM tblReport ${where_clause}`;
        db.get(sql, [], (err, row) => {
          if (err) {
            deferred.reject(new Error(`Failed to query count of all reports, error: ${err.message}`));
            return;
          }
          deferred.resolve(row.total_count);
        })
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function queryReportsInDateRange(offset, count, start_date, end_date) {
      let deferred = $q.defer();
      __init().then((db) => {
        count = count ? count : -1;
        offset = offset ? offset : 0;
        let where_clause = buildQueryWhereClause(start_date, end_date);

        let sql = `SELECT tblReport.id report_id,
           tblReport.department_id department_id,
           tblReport.issue_id issue_id,
           tblReport.creation_time creation_timestamp,
           tblDepartment.name department_name,
           tblIssue.name issue_name
         FROM tblReport
         LEFT JOIN tblDepartment ON tblDepartment.id = tblReport.department_id
         LEFT JOIN tblIssue ON tblIssue.id = tblReport.issue_id
         ${where_clause}
         ORDER BY tblReport.creation_time DESC
         LIMIT ${count} OFFSET ${offset}`
        db.all(sql, [], (err, rows) => {
          if (err) {
            deferred.reject(new Error(`Failed to query all reports, sql: ${sql}, error: ${err.message}`));
            return;
          }
          let reports = [];
          rows.forEach((row) => {
            let department = new Department(row.department_id, row.department_name);
            let issue = new Issue(row.issue_id, row.issue_name);
            let report = new Report(row.report_id, department, issue);
            report.creation_timestamp = row.creation_timestamp;
            reports.push(report);
          });
          deferred.resolve(reports);
        });

      }, (err) => {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function queryReportDetails(report_object) {
      let deferred = $q.defer();
      if (!report_object || !(report_object instanceof Report)
      || !report_object.id) {
        deferred.reject(new Error("Failed to query report details with invalid report object"));
        return deferred.promise;
      }

      __init().then((db) => {
        let sql = "SELECT id, option_id, option_value WHERE report_id = ?";
        db.all(sql, [report_object.id], (err, rows) => {
          if (err) {
            deferred.reject(new Error(`Failed to query report details with id ${report_object.id}, sql: ${sql}, error: ${err.message}`));
            return;
          }
          rows.forEach((row) => {

          });
          deferred.resolve();
        });
      }, (err) => {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    return {
      addReport: addReport,
      removeReport: removeReport,
      updateReport: updateReport,
      queryReportsCount: queryReportsCountInDataRange,
      queryReportsMinCreationTime, queryReportsMinCreationTime,
      queryReports: queryReportsInDateRange,
      queryReportDetails: queryReportDetails,
    }
  }]);
