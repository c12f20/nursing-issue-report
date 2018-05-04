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
        controller: 'AccordionDemoCtrl'
      })
      .state('root.config', {
        url: 'config',
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
      });
  }]);
