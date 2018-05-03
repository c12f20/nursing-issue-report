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
      options_list.forEach((option) => {
        
      })
      deferred.resolve();
      return deferred.promise;
    }

    function __addIssue(issue_name, options_list) {
      let deferred = $q.defer();
      if (!issue_name || issue_name.length == 0) {
        deferred.reject(new Error("Failed to add issue with invalid parameters"));
        return deferred.promise;
      }

      __init().then((db) => {
        let sql = "INSERT INTO tblIssue (name) VALUES (?)";
        db.run(sql, [issue_name],
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to add issue, error: ${err.message}`));
              return;
            }
            __addIssueOptions(db, this.last_id, options_list).then(() => {
              deferred.resolve();
            }, (err) => {
              deferred.reject(err);
            });
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __removeIssue(issue_id) {

    }

    function __removeIssues(issues_id_array) {

    }

    function __updateIssue(issue_object) {

    }

    function __queryAllIssuesCount() {

    }

    function __queryAllIssues(offset, count) {

    }


  }]);
