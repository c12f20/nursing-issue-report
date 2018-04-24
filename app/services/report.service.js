'use strict';

nirServices.factory('ReportService', ['DBService',
  function(dbService){
    function createReport(department_id, issue_object) {
      if (!(issue_object instanceof Issue)) {
        console.warn("Can't create report with invalid Issue object");
        return false;
      }

    }

    return {
      create: createReport
    }
  }]);
