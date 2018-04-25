'use strict';

class Option {
  constructor(id, name, value_names) {
    this.__id = id;
    this.__name = name;
    this.__value_names = value_names;
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

  set value_names(value_names) {
    this.__value_names = value_names;
  }

  get value_names() {
    return this.__value_names;
  }
}
