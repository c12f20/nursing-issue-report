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
        department.checked = $scope.departments_info.checkedAll;
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

    const DEPARTMENT_COUNT_PER_PAGE = 5;
    const DEPARTMENT_MAX_COUNT_PAGES = 5;
    $scope.departments_info = {
      checkedAll: false,
      count_per_page: DEPARTMENT_COUNT_PER_PAGE,
      max_count_pages: DEPARTMENT_MAX_COUNT_PAGES,
      total_count: 0,
      cur_page: 1,
    }

    function query_departments_info() {
      departmentService.queryDepartmentsCount()
        .then((count) => {
          $scope.departments_info.total_count = count;
          load_departments_page_at($scope.departments_info.cur_page);
        }, (err) => {
          console.error(err);
        });
    }

    $scope.department_list = undefined;
    function load_departments_page_at(page_index) {
      let offset = (page_index-1) * $scope.departments_info.count_per_page;
      let count = $scope.departments_info.count_per_page;
      departmentService.queryDepartments(offset, count)
        .then((list) => {
          $scope.departments_info.checkedAll = false;
          $scope.department_list = list;
        }, (err) => {
          console.error(err);
        });
    }

    $scope.onDepartmentPageChanged = function() {
      load_departments_page_at($scope.departments_info.cur_page);
    }

    query_departments_info();
  }]);
