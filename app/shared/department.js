'use strict';

class Department {
  constructor(id, name) {
    this.__id = id;
    this.__name = name;
  }

  set name(name) {
    this.__name = name;
  }

  get name() {
    return this.__name;
  }
}
