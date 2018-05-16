'use strict';

nirApp.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('root', {
        url: '/',
        templateUrl: 'components/root.component.html',
        controller: 'RootController'
      })
      .state('root.home', {
        url: 'home',
        templateUrl: 'components/home/home.component.html',
        controller: 'HomeController'
      })
      .state('root.demo', {
        url: 'demo',
        templateUrl: 'components/demo/demo.component.html',
        controller: 'treeGridController'
      })
      .state('root.report', {
        url: 'report',
        templateUrl: 'components/report/report.component.html',
        controller: 'ReportController'
      })
      .state('root.config', {
        url: 'config',
        params: {
          open_state: [false, false],
        },
        templateUrl: 'components/config/config.component.html',
        controller: 'ConfigController'
      })
      .state('root.issue_detail', {
        url: 'issue_detail',
        params: {
          issue_object: undefined,
        },
        templateUrl: 'components/config/issue_detail/issue_detail.component.html',
        controller: 'IssueDetailController'
      })
      .state('root.option_detail', {
        url: 'option_detail',
        params: {
          issue_object: undefined,
          option_object: undefined,
        },
        templateUrl: 'components/config/option_detail/option_detail.component.html',
        controller: 'OptionDetailController'
      });
  }]);
