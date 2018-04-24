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
      .state('root.issues', {
        url: 'issues',
        templateUrl: 'components/issues/issues.component.html',
        controller: 'IssuesController'
      });
  }]);
