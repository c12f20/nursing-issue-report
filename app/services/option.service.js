'use strict';

nirServices.factory('OptionService', ['$q', 'DbService',
  function($q, dbService) {
    function __init() {
      let deferred = $q.defer();
      dbService.create().then((db_handle) => {
        deferred.resolve(db_handle);
      }, (err) => {
        deferred.reject(new Error(`OptionService: failed to get DB Handle, error: ${err.message}`));
        db = null;
      })
      return deferred.promise;
    }

    function __addOption(issue_id, option_name, values_name_list) {
      let deferred = $q.defer();
      if (!issue_id || !option_name || option_name.length == 0) {
        deferred.reject(new Error("Failed to add option with invalid parameters"));
        return deferred.promise;
      }
      let option_values = values_name_list ? values_name_list : [];
      __init().then((db) => {
        let sql = "INSERT INTO tblOption (issue_id, name, option_values) VALUES (?, ?, ?)";
        db.run(sql, [issue_id, option_name, JSON.stringify(option_values)],
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to add option, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __removeOption(option_id) {
      let deferred = $q.defer();
      if (!option_id) {
        deferred.reject(new Error("Failed to remove option with invalid option id"));
        return deferred.promise;
      }

      __init().then((db) => {
        let sql = "DELETE FROM tblOption WHERE id=?";
        db.run(sql, option_id,
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to remove option ${option_id}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __removeOptions(options_id_array) {
      let deferred = $q.defer();
      if (!options_id_array) {
        deferred.reject(new Error("Failed to remove options with invalid options id array"));
        return deferred.promise;
      }
      __init().then((db) => {
        let ids = options_id_array.join();
        let sql = `DELETE FROM tblOption WHERE id IN (${ids})`;
        db.run(sql, [],
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to remove options ${ids}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __updateOption(option_object) {
      let deferred = $q.defer();
      if (!option_object || !(option_object instanceof Option)
      || !option_object.id || !option_object.name) {
        deferred.reject(new Error("Failed to update option with invalid option object"));
        return deferred.promise;
      }
      let option_values_data = JSON.stringify(option_object.value_names ? option_object.value_names : []);
      __init().then((db) => {
        let sql = `UPDATE tblOption SET
          name = '${option_object.name}',
          option_values = '${option_values_data}'
          WHERE id = ${option_object.id}`;
        db.run(sql, [],
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to update option ${option_object.id}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    return {
      addOption: __addOption,
      removeOption: __removeOption,
      removeOptions: __removeOptions,
      updateOption: __updateOption,
    }
  }]);
