'use strict';

class Department {
  constructor(id, name) {
    this.__id = id;
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

  equals(other) {
    if (!other || !(other instanceof Department)) {
      return false;
    }
    return this.__id == other.id && this.__name == other.name;
  }

  clone() {
    let new_obj = new Department(this.__id, this.__name);
    return new_obj;
  }
}
