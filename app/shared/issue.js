'use strict';

class Issue {
  constructor(issue_id, options) {
    this.__id = issue_id;
    this.__options = options;
    this.__creation_time = 0;
  }

  get id() {
    return this.__id;
  }

  get options() {
    return this.__options;
  }
}
