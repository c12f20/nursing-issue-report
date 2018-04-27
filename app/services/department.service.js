'use strict';

nirServices.factory('DepartmentService', ['DbService',
  function(dbService) {
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

    function addDepartment(department_name) {
      return new Promise((resolve, reject) => {
        if (!department_name) {
          reject(new Error("Failed to add department with invalid parameters"));
          return;
        }
        if (!db) {
          reject(new Error("Failed to add department as database isn't ready"));
          return;
        }
        let sql = "INSERT INTO tblDepartment (name) VALUES (?)";
        db.run(sql, department_name,
          (err) => {
            if (err) {
              reject(new Error(`Failed to add department, error: ${err.message}`));
              return;
            }
            resolve();
          });
      });
    }

    function removeDepartment(department_id) {
      return new Promise((resolve, reject) => {
        if (!department_id) {
          reject(new Error("Failed to remove department with invalid department id"));
          return;
        }
        if (!db) {
          reject(new Error("Failed to add department as database isn't ready"));
          return;
        }
        let sql = "DELETE FROM tblDepartment WHERE id=?";
        db.run(sql, department_id,
          (err) => {
            if (err) {
              reject(new Error(`Failed to remove department ${department_id}, error: ${err.message}`));
              return;
            }
            resolve();
          });
      });
    }

    function updateDepartment(department_object) {
      return new Promise((resolve, reject) => {
        if (!department_object || !(department_object instanceof Department)
        || !department_object.id || !department_object.name) {
          reject(new Error("Failed to update department with invalid department object"));
          return;
        }
        if (!db) {
          reject(new Error("Failed to add department as database isn't ready"));
          return;
        }
        let sql = `UPDATE tblDepartment SET
          name = ${department_object.name}
          WHERE id = ${department_object.id}`;
        db.run(sql, [],
          (err) => {
            if (err) {
              reject(new Error(`Failed to update department ${department_object.id}, error: ${err.message}`));
              return;
            }
            resolve();
          });
      });
    }

    function queryAllDepartments(offset, count) {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error("Failed to query all departments as database isn't ready"));
          return;
        }
        offset = offset ? offset : 0;
        count = count ? count : -1;
        let sql = `SELECT id, name FROM tblDepartment LIMIT ${count} OFFSET ${offset}`;
        db.all(sql, [], (err, rows) => {
          if (err) {
            reject(new Error(`Failed to query all departments, error: ${err.message}`));
            return;
          }
          let departments = [];
          rows.forEach((row) => {
            let department = new Department(row.id, row.name);
            departments.push(department);
          });
          resolve(departments);
        });
      });
    }

    return {
      addDepartment: addDepartment,
      removeDepartment: removeDepartment,
      updateDepartment: updateDepartment,
      queryDepartments: queryAllDepartments
    }
  }]);
