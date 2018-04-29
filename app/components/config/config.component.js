'use strict';

nirControllers.controller('ConfigController', ['$scope', 'DepartmentService',
  function($scope, departmentService) {
    $scope.department_panel = {
      open: false,
    };

    // Department List
    $scope.onCheckAll = function() {
      if (!$scope.department_list || $scope.department_list.length == 0) {
        return;
      }
      $scope.department_list.forEach((department) => {
        department.checked = $scope.department_panel.checkedAll;
      });
    }

    $scope.onDeleteDepartment = function(index) {
      let department = $scope.department_list[index];
      console.log(`Delete Department ${department.name}`);
    }

    $scope.onDeleteCheckedDepartments = function() {
      if (!$scope.department_list || $scope.department_list.length == 0) {
        return;
      }
      $scope.department_list.forEach((department) => {
        if (department.checked) {
          console.log(`Delete Department ${department.name}`);
        }
      });
    }

    $scope.hasCheckedDepartments = function() {
      if (!$scope.department_list || $scope.department_list.length == 0) {
        return false;
      }
      for (let i=0; i < $scope.department_list.length; i++) {
        let department = $scope.department_list[i];
        if (department.checked) {
          return true;
        }
      }
      return false;
    }

    $scope.onAddDepartment = function() {
      console.log('Add new Department');
    }

    $scope.department_list = undefined;
    function load_departments() {
      departmentService.queryDepartments()
        .then((list) => {
          $scope.department_list = list;
        }, (err) => {
          console.error(err);
        });
    }


    load_departments();
  }]);
