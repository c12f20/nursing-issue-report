'use strict';

nirControllers.controller('IssueDetailController', ['$scope', '$stateParams', '$filter', 'IssueService',
  function($scope, $stateParams, $filter, issueService) {
    $scope.page_info = {
      title: undefined,
    }

    $scope.issue_object = undefined;
    function loadData() {
      if ($stateParams.issue_object) {
        $scope.page_info.title = $filter('translate')('CAPTION_EDIT_ISSUE');
        issueService.queryIssueDetail($stateParams.issue_object)
          .then((issue_object) => {
            $scope.issue_object = issue_object;
          }, (err) => {
            console.error(err);
          })
      } else {
        $scope.page_info.title = $filter('translate')('CAPTION_ADD_ISSUE');
      }
    }

    loadData();
  }]);
