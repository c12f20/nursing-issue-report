'use strict';

class Issue {
  constructor(issue_id, options) {
    this.__id = issue_id;
    this.__options = options;
  }

  get id() {
    return this.__id;
  }

  get options() {
    return this.__options;
  }

  set name(name) {
    this.__name = name;
  }

  get name() {
    this.__name;
  }
}
