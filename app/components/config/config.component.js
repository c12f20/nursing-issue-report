'use strict';

nirControllers.controller('ConfigController', ['$scope', 'DepartmentService',
  function($scope, departmentService) {
    $scope.state = {
      open: true,
    };
    $scope.department_list = undefined;
    departmentService.queryDepartments()
      .then((list) => {
        $scope.department_list = list;
      }, (err) => {
        console.error(err);
      });
  }]);
