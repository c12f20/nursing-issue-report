'use strict';

nirServices.factory('OptionService', ['$q', 'DbService',
  function($q, dbService) {
    // Database part
    function __init() {
      let deferred = $q.defer();
      dbService.create().then((db_handle) => {
        deferred.resolve(db_handle);
      }, (err) => {
        deferred.reject(new Error(`OptionService: failed to get DB Handle, error: ${err.message}`));
      })
      return deferred.promise;
    }

    // Option table related methods
    function addOptionWithTransaction(transaction, issue_id, option_object) {
      let deferred = $q.defer();
      if (!transaction || !issue_id || !option_object || !option_object.name || option_object.name.length == 0
        || !option_object.db_index) {
        deferred.reject(new Error("Failed to add option with invalid parameters"));
        return deferred.promise;
      }
      let option_values = option_object.value_names ? option_object.value_names : [];
      let sql = "INSERT INTO tblOption (issue_id, name, option_index, option_values) VALUES (?, ?, ?, ?)";
      transaction.run(sql, [issue_id, option_object.name, option_object.db_index, JSON.stringify(option_values)],
        (err) => {
          if (err) {
            deferred.reject(new Error(`Failed to add option, error: ${err.message}`));
            return;
          }
          deferred.resolve();
        });
      return deferred.promise;
    }

    function removeOption(option_id) {
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

    function removeOptionsWithTransaction(transaction, options_id_array) {
      let deferred = $q.defer();
      if (!options_id_array) {
        deferred.reject(new Error("Failed to remove options with invalid options id array"));
        return deferred.promise;
      }
      let ids = options_id_array.join();
      let sql = `DELETE FROM tblOption WHERE id IN (${ids})`;
      transaction.run(sql, [],
        (err) => {
          if (err) {
            deferred.reject(new Error(`Failed to remove options ${ids}, error: ${err.message}`));
            return;
          }
          deferred.resolve();
        });
      return deferred.promise;
    }

    function updateOptionWithTransaction(transaction, option_object) {
      let deferred = $q.defer();
      if (!option_object || !(option_object instanceof Option)
      || !option_object.id || !option_object.name || !option_object.db_index) {
        deferred.reject(new Error("Failed to update option with invalid option object"));
        return deferred.promise;
      }
      let option_values_data = JSON.stringify(option_object.value_names ? option_object.value_names : []);
      let sql = `UPDATE tblOption SET
        name = '${option_object.name}',
        option_index = '${option_object.db_index}',
        option_values = '${option_values_data}'
        WHERE id = ${option_object.id}`;
      transaction.run(sql, [],
        (err) => {
          if (err) {
            deferred.reject(new Error(`Failed to update option ${option_object.id}, error: ${err.message}`));
            return;
          }
          deferred.resolve();
        });
      return deferred.promise;
    }

    function queryOptionsByIssueId(issue_id) {
      let deferred = $q.defer();
      if (!issue_id) {
        deferred.reject(new Error("Failed to query options with invalid issue id"));
        return deferred.promise;
      }
      __init().then((db) => {
        let sql = "SELECT id, option_index, name, option_values FROM tblOption WHERE issue_id = ? ORDER BY option_index ASC";
        db.all(sql, [issue_id], (err, rows) => {
          if (err) {
            deferred.reject(new Error(`Failed to query all options by issue id: ${issue_id}, error: ${err.message}`));
            return;
          }
          let options = [];
          let cur_option = undefined;
          rows.forEach((row) => {
            let option_values = JSON.parse(row.option_values);
            let option = new Option(row.id, row.name, option_values);
            option.db_index = row.option_index;
            if (Math.floor(row.option_index) == row.option_index) { // it's integer, so it's a 1st level option
              option.index = Math.floor(row.option_index);
              options.push(option);
              cur_option = option;
            } else { // it contains decimal, so it's 2nd level option
              option.parent_name = cur_option.name;
              option.index = Math.round((row.option_index-Math.floor(row.option_index)) * 100);
              if (cur_option.children) {
                cur_option.children.push(option);
              } else {
                cur_option.children = [option];
              }
            }
          });
          deferred.resolve(options);
        });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }
    // ReportDetail table related methods
    function addOptionValueWithTransaction(transaction, report_id, option_object) {
      let deferred = $q.defer();
      if (!transaction || !report_id || !option_object || !option_object.value
        || option_object.value.length == 0) {
        deferred.reject(new Error("Failed to add option value with invalid parameters"));
        return deferred.promise;
      }
      let sql = "INSERT INTO tblReportDetail (report_id, option_id, option_value) VALUES (?, ?, ?)";
      transaction.run(sql, [report_id, option_object.id, option_object.value],
        (err) => {
          if (err) {
            deferred.reject(new Error(`Failed to add option value, error: ${err.message}`));
            return;
          }
          deferred.resolve();
        });
      return deferred.promise;
    }

    function updateOptionValueWithTransaction(transaction, report_id, option_object) {
      let deferred = $q.defer();
      if (!transaction || !report_id || !option_object || !option_object.id || !option_object.value
        || option_object.value.length == 0) {
        deferred.reject(new Error("Failed to update option value with invalid parameters"));
        return deferred.promise;
      }
      let sql = `UPDATE tblReportDetail SET
        report_id = '${report_id}',
        option_id = '${option_object.id}',
        option_value = '${option_object.value}'
        WHERE id = ${option_object.value_id}`;
      transaction.run(sql, [],
        (err) => {
          if (err) {
            deferred.reject(new Error(`Failed to update option value, error: ${err.message}`));
            return;
          }
          deferred.resolve();
        });
      return deferred.promise;
    }

    function removeOptionValueWithTransaction(transaction, option_value_id) {
      let deferred = $q.defer();
      if (!transaction || !option_value_id) {
        deferred.reject(new Error("Failed to delete option value with invalid parameters"));
        return deferred.promise;
      }
      let sql = `DELETE FROM tblReportDetail WHERE id = ${option_value_id}`;
      transaction.run(sql, [],
        (err) => {
          if (err) {
            deferred.reject(new Error(`Failed to delete option value, error: ${err.message}`));
            return;
          }
          deferred.resolve();
        });
      return deferred.promise;
    }

    // Option List related methods
    function getOptionById(options_list, id) {
      if (!options_list) {
        return undefined;
      }

      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        if (option.id == id) {
          return option;
        }
        let child_option = getOptionById(option.children, id);
        if (child_option) {
          return child_option;
        }
      }
      return undefined;
    }

    function getRootOptionByName(options_list, name) {
      if (!options_list) {
        return undefined;
      }
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        if (option.name == name) {
          return option;
        }
      }
      return undefined;
    }

    function convertOptionTreeToList(options_tree) {
      if (!options_tree) {
        return;
      }

      let option_list = [];
      for (let i=0; i < options_tree.length; i++) {
        let option = options_tree[i];
        option.db_index = option.index;
        option_list.push(option);
        if (option.children) { // process children options
          for (let j=0; j < option.children.length; j++) {
            let child_option = option.children[j];
            child_option.db_index = option.index + child_option.index/100;
            option_list.push(child_option);
          }
        }
      }
      return option_list;
    }

    function updateListIndex(options_list) {
      if (!options_list) {
        return;
      }
      for (let i=0; i < options_list.length; i++) {
        let option = options_list[i];
        option.index = i+1;
      }
    }

    function isOptionTreeValueValid(options_tree) {
      if (!options_tree) {
        return true;
      }
      for (let i=0; i < options_tree.length; i++) {
        let option = options_tree[i];
        if (!option.isValueValid()) {
          return false;
        }
        if (option.hasChildren()) {
          if (!isOptionTreeValueValid(option.children)) {
            return false;
          }
        }
      }
      return true;
    }

    return {
      // Option Table part
      addOptionWithTransaction: addOptionWithTransaction,
      removeOption: removeOption,
      removeOptionsWithTransaction: removeOptionsWithTransaction,
      updateOptionWithTransaction: updateOptionWithTransaction,
      queryIssueOptions: queryOptionsByIssueId,
      // Report Detail Table part
      addOptionValueWithTransaction: addOptionValueWithTransaction,
      removeOptionValueWithTransaction: removeOptionValueWithTransaction,
      updateOptionValueWithTransaction: updateOptionValueWithTransaction,
      // Option List part
      getOptionById:getOptionById,
      getRootOptionByName:getRootOptionByName,
      convertOptionTreeToList: convertOptionTreeToList,
      updateListIndex: updateListIndex,
      isOptionTreeValueValid: isOptionTreeValueValid,
    }
  }]);
