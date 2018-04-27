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
}
