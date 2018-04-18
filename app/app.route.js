'use strict';

const mmdApp = angular.module('mmdApp');

mmdApp.config(['$routeProvider',
  function($routeProvider){
    $routeProvider
      .when('/main', {
        templateUrl: 'components/home/home.component.html',
        controller: 'HomeController'
      })
      .otherwise({
        redirectTo: function(route, path, search) {
          return '/main';
        }
      });
  }]);
