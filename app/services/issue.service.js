'use strict';

nirServices.factory('IssueService', ['$q', 'DbService', 'OptionService',
  function($q, dbService, optionService) {
    function __init() {
      let deferred = $q.defer();
      dbService.create().then((db_handle) => {
        deferred.resolve(db_handle);
      }, (err) => {
        deferred.reject(new Error(`IssueService: failed to get DB Handle, error: ${err.message}`));
      })
      return deferred.promise;
    }
    // Add Issue
    function __addIssueOptions(transaction, issue_id, options_tree) {
      let deferred = $q.defer();
      if (!options_tree || options_tree.length == 0) {
        deferred.resolve();
        return deferred.promise;
      }
      let options_list = optionService.convertOptionTreeToList(options_tree);
      let addOptionPromises = [];
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        addOptionPromises.push(optionService.addOptionWithTransaction(transaction, issue_id, option));
      }
      $q.all(addOptionPromises).then(() => {
          deferred.resolve();
        }, (err) => {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function addIssue(issue_name, options_list) {
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
          transaction.run(sql, [issue_name],
            function(err) {
              if (err) {
                deferred.reject(new Error(`Failed to add issue, error: ${err.message}`));
                return;
              }
              __addIssueOptions(transaction, this.lastID, options_list).then(() => {
                transaction.commit((err) => {
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
    // Remove Issue
    function removeIssue(issue_id) {
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

    function removeIssues(issues_id_array) {
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
    // Update Issue
    function __updateIssueOptions(transaction, issue_id, options_tree) {
      let deferred = $q.defer();
      if (!options_tree || options_tree.length == 0) {
        deferred.resolve();
        return deferred.promise;
      }
      let options_list = optionService.convertOptionTreeToList(options_tree);
      let updateOptionPromises = [];
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        let result;
        if (option.id) {
          result = optionService.updateOptionWithTransaction(transaction, option);
        } else {
          result = optionService.addOptionWithTransaction(transaction, issue_id, option);
        }
        updateOptionPromises.push(result);
      }
      $q.all(updateOptionPromises).then(() => {
          deferred.resolve();
        }, (err) => {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function updateIssue(issue_object, remove_option_ids) {
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
          transaction.run(sql, [],
            (err) => {
              if (err) {
                deferred.reject(new Error(`Failed to update issue ${issue_object.id}, error: ${err.message}`));
                return;
              }
              optionService.removeOptionsWithTransaction(transaction, remove_option_ids)
                .then(() => {
                  return __updateIssueOptions(transaction, issue_object.id, issue_object.options);
                })
                .then(() => {
                  transaction.commit((err) => {
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
    // Query Issue
    function queryAllIssuesCount() {
      let deferred = $q.defer();
      __init().then((db) => {
        let sql = "SELECT count(id) total_count FROM tblIssue";
        db.get(sql, [], (err, row) => {
          if (err) {
            deferred.reject(new Error(`Failed to query count of all issues, error: ${err.message}`));
            return;
          }
          deferred.resolve(row.total_count);
        })
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function queryAllIssues(offset, count) {
      let deferred = $q.defer();
      __init().then((db) => {
        offset = offset ? offset : 0;
        count = count ? count : -1;
        console.log(`Query issues offset: ${offset}, count: ${count}`);
        let sql = `SELECT id, name FROM tblIssue LIMIT ${count} OFFSET ${offset}`;
        db.all(sql, [], (err, rows) => {
          if (err) {
            deferred.reject(new Error(`Failed to query all issues, error: ${err.message}`));
            return;
          }
          let issues = [];
          rows.forEach((row) => {
            let issue = new Issue(row.id, row.name);
            issues.push(issue);
          });
          deferred.resolve(issues);
        });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function queryIssueDetail(issue_object) {
      let deferred = $q.defer();
      if (!issue_object || !(issue_object instanceof Issue)
      || !issue_object.id) {
        deferred.reject(new Error("Failed to query issue detail with invalid issue object"));
        return deferred.promise;
      }

      optionService.queryIssueOptions(issue_object.id)
        .then((options) => {
          issue_object.options = options;
          deferred.resolve(issue_object);
        }, (err) => {
          deferred.reject(err);
        });
      return deferred.promise;
    }
    // For UI usage
    let editing_issue = undefined;
    function setEditingIssue(issue_object) {
      editing_issue = issue_object;
      __resetRemovedOptions();
    }

    function getEditingIssue() {
      return editing_issue;
    }

    let removed_options = [];
    function __resetRemovedOptions() {
      removed_options = [];
    }

    function appendRemovedOptions(new_removed_list) {
      new_removed_list.forEach((option) => {
        if (option.id) {
          removed_options.push(option.id);
        }
      })
    }

    function getRemovedOptionIds() {
      return removed_options;
    }

    return {
      // Database part
      addIssue: addIssue,
      removeIssue: removeIssue,
      removeIssues: removeIssues,
      updateIssue: updateIssue,
      queryIssuesCount: queryAllIssuesCount,
      queryIssues: queryAllIssues,
      queryIssueDetail: queryIssueDetail,
      // For UI usage
      setEditingIssue: setEditingIssue,
      getEditingIssue: getEditingIssue,
      appendRemovedOptions: appendRemovedOptions,
      getRemovedOptionIds: getRemovedOptionIds,
    }
  }]);
