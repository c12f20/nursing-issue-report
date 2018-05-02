'use strict';

nirServices.factory('DepartmentService', ['$q', 'DbService',
  function($q, dbService) {
    function __init() {
      let deferred = $q.defer();
      dbService.create().then((db_handle) => {
        deferred.resolve(db_handle);
      }, (err) => {
        deferred.reject(new Error(`DepartmentService: failed to get DB Handle, error: ${err.message}`));
        db = null;
      })
      return deferred.promise;
    }

    function __addDepartment(department_name) {
      let deferred = $q.defer();
      if (!department_name) {
        deferred.reject(new Error("Failed to add department with invalid parameters"));
        return deferred.promise;
      }
      __init().then((db) => {
        let sql = "INSERT INTO tblDepartment (name) VALUES (?)";
        db.run(sql, department_name,
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to add department, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __removeDepartments(departments_id_array) {
      let deferred = $q.defer();
      if (!departments_id_array) {
        deferred.reject(new Error("Failed to remove departments with invalid departments id array"));
        return deferred.promise;
      }
      __init().then((db) => {
        let ids = departments_id_array.join();
        let sql = `DELETE FROM tblDepartment WHERE id IN (${ids})`;
        db.run(sql, [],
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to remove departments ${ids}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __removeDepartment(department_id) {
      let deferred = $q.defer();
      if (!department_id) {
        deferred.reject(new Error("Failed to remove department with invalid department id"));
        return deferred.promise;
      }
      __init().then((db) => {
        let sql = "DELETE FROM tblDepartment WHERE id=?";
        db.run(sql, department_id,
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to remove department ${department_id}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __updateDepartment(department_object) {
      let deferred = $q.defer();
      if (!department_object || !(department_object instanceof Department)
      || !department_object.id || !department_object.name) {
        deferred.reject(new Error("Failed to update department with invalid department object"));
        return deferred.promise;
      }
      __init().then((db) => {
        let sql = `UPDATE tblDepartment SET
          name = '${department_object.name}'
          WHERE id = ${department_object.id}`;
        db.run(sql, [],
          (err) => {
            if (err) {
              deferred.reject(new Error(`Failed to update department ${department_object.id}, error: ${err.message}`));
              return;
            }
            deferred.resolve();
          });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __queryAllDepartmentsCount() {
      let deferred = $q.defer();
      __init().then((db) => {
        let sql = "SELECT count(id) total_count FROM tblDepartment";
        db.get(sql, [], (err, row) => {
          if (err) {
            deferred.reject(new Error(`Failed to query count of all departments, error: ${err.message}`));
            return;
          }
          deferred.resolve(row.total_count);
        })
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function __queryAllDepartments(offset, count) {
      let deferred = $q.defer();

      __init().then((db) => {
        console.log(`Query departments offset: ${offset}, count: ${count}`);
        offset = offset ? offset : 0;
        count = count ? count : -1;
        let sql = `SELECT id, name FROM tblDepartment LIMIT ${count} OFFSET ${offset}`;
        db.all(sql, [], (err, rows) => {
          if (err) {
            deferred.reject(new Error(`Failed to query all departments, error: ${err.message}`));
            return;
          }
          let departments = [];
          rows.forEach((row) => {
            let department = new Department(row.id, row.name);
            departments.push(department);
          });
          deferred.resolve(departments);
        });
      }, (err) => {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    return {
      addDepartment: __addDepartment,
      removeDepartment: __removeDepartment,
      removeDepartments: __removeDepartments,
      updateDepartment: __updateDepartment,
      queryDepartmentsCount: __queryAllDepartmentsCount,
      queryDepartments: __queryAllDepartments
    };
  }]);
