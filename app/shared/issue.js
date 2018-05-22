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
    return this.__name;
  }

  set options(options) {
    this.__options = options;
  }

  get options() {
    return this.__options;
  }

  hasOptions() {
    return this.__options && this.__options.length > 0;
  }

  equals(other) {
    if (!other || !(other instanceof Issue)) {
      return false;
    }
    if (!(this.__id == other.__id && this.__name == other.name)) {
      return false;
    }
    if (this.__options && other.options) {
      if (this.__options.length != other.options.length) {
        return false;
      }
      for (let i=0; i < this.__options.length; i++) {
        if (!this.__options[i].equals(other.options[i])) {
          return false;
        }
      }
    } else {
      if (this.__options && this.__options.length > 0 && !other.options
        || !this.__options && other.options && other.options.length > 0) {
        return false;
      }
    }
    return true;
  }

  clone() {
    let new_obj = new Issue(this.__id, this.__name);
    if (this.__options) {
      let new_options = [];
      for (let i=0; i < this.__options.length; i++) {
        let new_option = this.__options[i].clone();
        new_options.push(new_option);
      }
      new_obj.options = new_options;
    }
    return new_obj;
  }
}
