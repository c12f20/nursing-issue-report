'use strict';

class Issue {
  constructor(issue_id, name) {
    this.__id = issue_id;
    this.__name = name;
  }

  get id() {
    return this.__id;
  }

  set name(name) {
    this.__name = name;
  }

  get name() {
    this.__name;
  }

  set options(options) {
    this.__options = options;
  }

  get options() {
    return this.__options;
  }
}
