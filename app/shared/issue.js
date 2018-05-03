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

  equals(other) {
    if (!other || !(other instanceof Issue)) {
      return false;
    }
    if (this.__options && other.options) {
      if (this.__options.length != other.options.length) {
        return false;
      }
      for (let i=0; i < this.__options.length; i++) {
        if(!this.__options[i].equals(other.options[i]) {
          return false;
        }
      }
    } else {
      if (this.__options && !other.options || !this.__options && other.options) {
        return false;
      }
    }
    return this.__id == other.__id && this.__name == other.name;
  }
}
