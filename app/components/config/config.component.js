'use strict';

nirControllers.controller('ConfigController', ['$scope', '$filter', 'ngDialog', 'DepartmentService',
  function($scope, $filter, ngDialog, departmentService) {
    $scope.department_panel = {
      open: false,
    };

    // Department List
    // About checkbox on the list
    $scope.onCheckAll = function() {
      if (!$scope.department_list || $scope.department_list.length == 0) {
        return;
      }
      $scope.department_list.forEach((department) => {
        department.checked = $scope.departments_info.checkedAll;
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
    // Department related Dialog
    let dialog_id = undefined;
    $scope.dialog_info = {};

    function showDeleteDepartmentConfirmDialog(remove_departments_array) {
      $scope.dialog_info.title = $filter('translate')('CAPTION_DELETE_DEPARTMENT');
      $scope.dialog_info.to_remove_departments_list = remove_departments_array;
      dialog_id = ngDialog.open({
        template: "components/config/department-remove-dlg-template.html",
        scope: $scope,
      });
    }

    $scope.onRemoveDialogConfirm = function(isYes) {
      if (!isYes) {
        dismissEditDepartmentDialog();
        return;
      }
      let to_remove_departments_ids = [];
      $scope.dialog_info.to_remove_departments_list.forEach((department) => {
        to_remove_departments_ids.push(department.id);
      });
      departmentService.removeDepartments(to_remove_departments_ids)
        .then(() => {
          query_departments_info();
        }, (err) => {
          console.error(err);
        }).finally(() => {
          dismissEditDepartmentDialog();
        });
    }

    $scope.isEditDataValid = function() {
      if ($scope.dialog_info.department_object) {
        return $scope.dialog_info.department_name && $scope.dialog_info.department_name.length > 0 && $scope.dialog_info.department_object.name != $scope.dialog_info.department_name;
      } else {
        return $scope.dialog_info.department_name && $scope.dialog_info.department_name.length > 0;
      }
    }

    $scope.onEditDialogConfirm = function() {
      if (!$scope.dialog_info.department_name || $scope.dialog_info.department_name.length == 0) {
        dismissEditDepartmentDialog();
        return;
      }

      if ($scope.dialog_info.department_object) {
        if ($scope.dialog_info.department_object.name == $scope.dialog_info.department_name) {
          dismissEditDepartmentDialog();
          return;
        }
        $scope.dialog_info.department_object.name = $scope.dialog_info.department_name;
        departmentService.updateDepartment($scope.dialog_info.department_object).then(() => {
          query_departments_info();
        }, (err) => {
          console.error(err);
        }).finally(() => {
          dismissEditDepartmentDialog();
        });
      } else {
        departmentService.addDepartment($scope.dialog_info.department_name).then(() => {
          query_departments_info();
        }, (err) => {
          console.error(err);
        }).finally(() => {
          dismissEditDepartmentDialog();
        });
      }
    }

    function showEditDepartmentDialog(department_object) {
      if (department_object) {
        $scope.dialog_info.title = $filter('translate')('CAPTION_EDIT_DEPARTMENT');
        $scope.dialog_info.department_object = department_object;
        $scope.dialog_info.department_name = department_object.name;
        $scope.dialog_info.button_caption = $filter('translate')('CAPTION_UPDATE');
      } else {
        $scope.dialog_info.title = $filter('translate')('CAPTION_ADD_DEPARTMENT');
        $scope.dialog_info.department_object = undefined;
        $scope.dialog_info.department_name = "";
        $scope.dialog_info.button_caption = $filter('translate')('CAPTION_ADD');
      }
      dialog_id = ngDialog.open({
        template: "components/config/department-edit-dlg-template.html",
        scope: $scope,
      });
    }

    function dismissEditDepartmentDialog() {
      if (dialog_id) {
        ngDialog.close(dialog_id);
      }
    }

    // methods of action buttons
    $scope.onDeleteDepartment = function(index) {
      let department = $scope.department_list[index];
      console.log(`Delete Department ${department.name}`);
      showDeleteDepartmentConfirmDialog([department]);
    }

    $scope.onDeleteCheckedDepartments = function() {
      if (!$scope.department_list || $scope.department_list.length == 0) {
        return;
      }
      let to_remove_list = [];
      $scope.department_list.forEach((department) => {
        if (department.checked) {
          console.log(`Delete Department ${department.name}`);
          to_remove_list.push(department);
        }
      });
      showDeleteDepartmentConfirmDialog(to_remove_list);
    }

    $scope.onAddDepartment = function() {
      console.log('Add new Department');
      showEditDepartmentDialog();
    }

    $scope.onEditDepartment = function(index) {
      let department = $scope.department_list[index];
      console.log(`Delete Department ${department.name}`);
      showEditDepartmentDialog(department);
    }

    // Load departments list methods
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
          let total_pages_count = Math.ceil(count / $scope.departments_info.count_per_page);
          if ($scope.departments_info.cur_page > total_pages_count) {
            $scope.departments_info.cur_page = total_pages_count;
          }
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
