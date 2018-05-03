'use strict';

class Option {
  constructor(id, name, value_names) {
    this.__id = id;
    this.__name = name;
    this.__value_names = value_names;
    this.__value_index = 0; // first value always be default one
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

  set value_index(index) {
    this.__value_index = index;
  }

  get value_index() {
    return this.__value_index;
  }

  get value() {
    if (this.__value_index >= 0 && this.__value_index < this.__value_names.length) {
      return this.__value_names[this.__value_index];
    } else {
      return undefined;
    }
  }

  equals(other) {
    if (!other || !(other instanceof Option)) {
      return false;
    }
    return this.__id == other.id && this.__name == other.name
      && JSON.stringify(this.__value_names) == JSON.stringify(other.value_names);
  }
}
