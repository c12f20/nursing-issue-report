'use strict';

nirServices.factory('IssueService', ['$q', 'DbService', 'OptionService',
  function($q, dbService, optionService) {
    function __init() {
      let deferred = $q.defer();
      dbService.create().then((db_handle) => {
        deferred.resolve(db_handle);
      }, (err) => {
        deferred.reject(new Error(`IssueService: failed to get DB Handle, error: ${err.message}`));
        db = null;
      })
      return deferred.promise;
    }

    function __addIssueOptions(db, issue_id, options_list) {
      let deferred = $q.defer();
      if (!options_list || options_list.length == 0) {
        deferred.resolve();
        return deferred.promise;
      }
      for (let i=0; i < options_list.length; i++) {
        option = options_list[i];
        optionService.addOption(issue_id, option.name, option.value_names)
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

    function __addIssue(issue_name, options_list) {
      let deferred = $q.defer();
      if (!issue_name || issue_name.length == 0) {
        deferred.reject(new Error("Failed to add issue with invalid parameters"));
        return deferred.promise;
      }

      __init().then((db) => {
        db.beginTransaction((err, transaction) => {
          if (err) {
            deferred.reject(err);
            return;
          }
          let sql = "INSERT INTO tblIssue (name) VALUES (?)";
          db.run(sql, [issue_name],
            (err) => {
              if (err) {
                deferred.reject(new Error(`Failed to add issue, error: ${err.message}`));
                return;
              }
              __addIssueOptions(db, this.last_id, options_list).then(() => {
                db.commit((err) => {
                  if (err) {
                    deferred.reject(err);
                    return;
                  }
                  deferred.resolve();
                })
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

    function __removeIssue(issue_id) {
      let deferred = $q.defer();
      if (!issue_id) {
        deferred.reject(new Error("Failed to remove issue with invalid issue id"));
        return deferred.promise;
      }

      __init().then((db) => {
        let sql = "DELETE FROM tblIssue WHERE id=?";
        db.run(sql, issue_id,
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to remove issue ${issue_id}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __removeIssues(issues_id_array) {
      let deferred = $q.defer();
      if (!issues_id_array) {
        deferred.reject(new Error("Failed to remove issues with invalid issues id array"));
        return deferred.promise;
      }
      __init().then((db) => {
        let ids = issues_id_array.join();
        let sql = `DELETE FROM tblIssue WHERE id IN (${ids})`;
        db.run(sql, [],
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to remove issues ${ids}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __updateIssueOptions(db, options_list) {
      let deferred = $q.defer();
      if (!options_list || options_list.length == 0) {
        deferred.resolve();
        return deferred.promise;
      }
      for (let i=0; i < options_list.length; i++) {
        option = options_list[i];
        optionService.updateOption(option)
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

    function __updateIssue(issue_object) {
      let deferred = $q.defer();
      if (!issue_object || !(issue_object instanceof Issue)
      || !issue_object.id || !issue_object.name) {
        deferred.reject(new Error("Failed to update issue with invalid parameters"));
        return deferred.promise;
      }
      __init().then((db) => {
        db.beginTransaction((err, transaction) => {
          if (err) {
            deferred.reject(err);
            return;
          }
          let sql = `UPDATE tblIssue SET
            name = '${issue_object.name}'
            WHERE id = ${issue_object.id}`;
          db.run(sql, [],
            (err) => {
              if (err) {
                deferred.reject(new Error(`Failed to update issue ${issue_object.id}, error: ${err.message}`));
                return;
              }
              __updateIssueOptions(db, issue_object.options).then(() => {
                db.commit((err) => {
                  if (err) {
                    deferred.reject(err);
                    return;
                  }
                  deferred.resolve();
                })
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

    function __queryAllIssuesCount() {

    }

    function __queryAllIssues(offset, count) {

    }


  }]);
