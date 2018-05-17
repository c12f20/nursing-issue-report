'use strict';

class Report {
  constructor(report_id, department_object, issue_object) {
    this.__id = report_id;
    this.__department_object = department_object;
    this.__issue_object = issue_object;
    this.__creation_time = new Date();
  }

  get id() {
    return this.__id;
  }

  set department(department_object) {
    this.__department_object = department_object;
  }

  get department() {
    return this.__department_object;
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

  set creation_timestamp(timestamp) {
    this.__creation_time = new Date(timestamp*1000);
  }

  get creation_timestamp() {
    return this.__creation_time.getTime()/1000;
  }
}
