'use strict';

nirServices.factory('ReportService', ['$q', 'DbService', 'OptionService',
  function($q, dbService, optionService) {
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
    function __addReportDetail(transaction, report_id, options_tree) {
      let deferred = $q.defer();
      if (!options_tree || options_tree.length == 0) {
        deferred.resolve();
        return deferred.promise;
      }
      let options_list = optionService.convertOptionTreeToList(options_tree);
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        if (!option.isCalculable()) {
          continue;
        }
        optionService.addOptionValueWithTransaction(transaction, report_id, option)
          .then(() => {
            if (i == options_list.length-1) { // last element
              deferred.resolve();
            }
          }, (err) => {
            deferred.reject(err);
          });
      }
      return deferred.promise;
    }

    function addReport(report_object) {
      let deferred = $q.defer();
      if (!report_object || !(report_object instanceof Report)
      || !report_object.department || !(report_object.department instanceof Department)
      || !report_object.issue || !(report_object.issue instanceof Issue)
      || !report_object.creation_time || !(report_object.creation_time instanceof Date)) {
        deferred.reject(new Error("Failed to add report with invalid parameters"));
        return deferred.promise;
      }
      __init().then((db) => {
        db.beginTransaction((err, transaction) => {
          if (err) {
            deferred.reject(err);
            return;
          }
          let department_id = report_object.department.id;
          let issue_id = report_object.issue.id;
          let creation_timestamp = report_object.creation_time.getTime()/1000;
          let sql = "INSERT INTO tblReport (department_id, issue_id, creation_time) VALUES (?, ? ,?)";
          transaction.run(sql, [department_id, issue_id, creation_timestamp],
            function(err) {
              if (err) {
                deferred.reject(new Error(`Failed to add report, error: ${err.message}`));
                return;
              }
              __addReportDetail(transaction, this.lastID, report_object.issue.options)
                .then(() => {
                  transaction.commit((err) => {
                    if (err) {
                      deferred.reject(err);
                      return;
                    }
                    deferred.resolve();
                  });
                }, (err) => {
                  deferred.reject(err);
                });
            });
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
        let sql = "DELETE FROM tblReport where id=?";
        db.run(sql, report_id,
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

    function __removeReportDetail(transaction, options_tree) {
      let deferred = $q.defer();
      if (!options_tree || options_tree.length == 0) {
        deferred.resolve();
        return deferred.promise;
      }
      let options_list = optionService.convertOptionTreeToList(options_tree);
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        if (!option.isCalculable()) {
          continue;
        }
        if (!option.value_id) {
          continue;
        }
        optionService.removeOptionValueWithTransaction(transaction, option.value_id)
          .then(() => {
            if (i == options_list.length-1) { // last element
              deferred.resolve();
            }
          }, (err) => {
            deferred.reject(err);
          });
      }
      return deferred.promise;
    }

    function __updateReportDetail(transaction, report_id, options_tree) {
      let deferred = $q.defer();
      if (!options_tree || options_tree.length == 0) {
        deferred.resolve();
        return deferred.promise;
      }

      let options_list = optionService.convertOptionTreeToList(options_tree);
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        if (!option.isCalculable()) {
          continue;
        }
        let result;
        if (option.value_id) {
          result = optionService.updateOptionValueWithTransaction(transaction, report_id, option);
        } else {
          result = optionService.addOptionValueWithTransaction(transaction, report_id, option);
        }
        result.then(() => {
          if (i == options_list.length-1) { // last element
            deferred.resolve();
          }
        }, (err) => {
          deferred.reject(err);
        });
      }
      return deferred.promise;
    }

    function updateReport(report_object, remove_options) {
      let deferred = $q.defer();
      if (!report_object || !report_object.id
      || !report_object.department || !(report_object.department instanceof Department)
      || !report_object.issue || !(report_object.issue instanceof Issue)
      || !report_object.creation_time || !(report_object.creation_time instanceof Date)) {
        deferred.reject(new Error("Failed to update report with invalid parameters"));
        return deferred.promise;
      }
      __init().then((db) => {
        db.beginTransaction((err, transaction) => {
          if (err) {
            deferred.reject(err);
            return;
          }
          let department_object = report_object.department;
          let issue_object = report_object.issue;
          let creation_timestamp = Math.floor(report_object.creation_time.getTime()/1000);
          let sql = `UPDATE tblReport SET
            department_id = ${department_object.id},
            issue_id = ${issue_object.id},
            creation_time = ${creation_timestamp}
            WHERE id = ${report_object.id}`;
          transaction.run(sql, [],
            (err) => {
              if (err) {
                deferred.reject(new Error(`Failed to update report ${report_object.id}, sql: ${sql}, error: ${err.message}`));
                return;
              }
              __updateReportDetail(transaction, report_object.id, report_object.issue.options)
                .then(() => {
                  return __removeReportDetail(transaction, remove_options);
                })
                .then(() => {
                  transaction.commit((err) => {
                    if (err) {
                      deferred.reject(err);
                      return;
                    }
                    deferred.resolve();
                  });
                }, (err) => {
                  deferred.reject(err);
                });
            });
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
      || !report_object.id || !report_object.issue) {
        deferred.reject(new Error("Failed to query report details with invalid report object"));
        return deferred.promise;
      }

      if (!report_object.issue.options || report_object.issue.options.length == 0) { // no options, no need to query values
        deferred.resolve();
        return deferred.promise;
      }

      __init().then((db) => {
        let sql = "SELECT id, option_id, option_value FROM tblReportDetail WHERE report_id = ?";
        db.all(sql, report_object.id, (err, rows) => {
          if (err) {
            deferred.reject(new Error(`Failed to query report details with id ${report_object.id}, sql: ${sql}, error: ${err.message}`));
            return;
          }
          rows.forEach((row) => {
            let option = optionService.getOptionById(report_object.issue.options, row.option_id);
            if (option) {
              option.value_id = row.id;
              option.value = row.option_value;
            }
          });
          deferred.resolve();
        });
      }, (err) => {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function queryIssueInfoByDepartmentInDateRange(department_id, start_date, end_date) {
      let deferred = $q.defer();
      __init().then((db) => {
        let where_clause = buildQueryWhereClause(start_date, end_date);
        if (where_clause.length == 0) {
          where_clause = `WHERE department_id=${department_id}`;
        } else {
          where_clause += ` and department_id=${department_id}`;
        }
        let sql = `SELECT issue_id, count(issue_id) issue_count
          FROM tblReport ${where_clause}
          GROUP BY issue_id`;
        db.all(sql, [], (err, rows) => {
          if (err) {
            deferred.reject(new Error(`Failed to query reports by department, sql: ${sql}, error: ${err.message}`));
            return;
          }
          let result_dict = {};
          rows.forEach((row) => {
            result_dict[row.issue_id] = row.issue_count;
          });
          deferred.resolve(result_dict);
        });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function queryOptionInfoByOptionIdInDateRange(option_id, start_date, end_date) {
      let deferred = $q.defer();
      __init().then((db) => {
        let where_clause = buildQueryWhereClause(start_date, end_date);
        if (where_clause.length == 0) {
          where_clause = `WHERE option_id=${option_id}`;
        } else {
          where_clause += ` and option_id=${option_id}`;
        }
        let sql = `SELECT option_value,
          count(option_value) value_count
          FROM tblReportDetail
          LEFT JOIN tblReport ON tblReportDetail.report_id == tblReport.id
          ${where_clause}
          GROUP BY option_value`;
        db.all(sql, [], (err, rows) => {
          if (err) {
            deferred.reject(new Error(`Failed to query reports by option id, sql: ${sql}, error: ${err.message}`));
            return;
          }
          let result_dict = {};
          rows.forEach((row) => {
            result_dict[row.option_value] = row.value_count;
          });
          deferred.resolve(result_dict);
        });
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
      queryIssueInfoByDepartment: queryIssueInfoByDepartmentInDateRange,
      queryOptionInfoById: queryOptionInfoByOptionIdInDateRange,
    }
  }]);
