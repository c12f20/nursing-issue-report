'use strict';

class Report {
  constructor(report_id, department_id, issue_object) {
    this.__id = report_id;
    this.__department_id = department_id;
    this.__issue_object = issue_object;
  }

  get id() {
    return this.__id;
  }

  set department_id(id) {
    this.__department_id = id;
  }

  get department_id() {
    return this.__department_id;
  }

  set issue(issue_object) {
    this.__issue_object = issue_object;
  }

  get issue() {
    return this.__issue_object;
  }

  set creation_time(time) {
    this.__creation_time = time;
  }

  get creation_time() {
    return this.__creation_time;
  }
}
