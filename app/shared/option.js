'use strict';

class Option {
  constructor(id, name, value_names) {
    this.__id = id;
    this.__name = name;
    this.__index = 0;
    this.__db_index = 0;
    this.__value_names = value_names; // Can't be undefined
    if (!this.__value_names) {
      throw new Error("value_names of Option can't be undefined");
    }
    if (this.__value_names.length > 0) {
      this.__value = this.__value_names[0]; // default value shall be first value of value_names
    }
    this.__children = [];
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

  set index(index) {
    this.__index = index;
  }

  get index() {
    return this.__index;
  }

  set db_index(index) {
    this.__db_index = index;
  }

  get db_index() {
    return this.__db_index;
  }

  set parent_name(name) {
    this.__parent_name = name;
  }

  get parent_name() {
    return this.__parent_name;
  }

  set value_names(value_names) {
    this.__value_names = value_names;
    if (value_names && value_names.length > 0) {
      this.__value = value_names[0]; // default value shall be first value of value_names
    }
  }

  get value_names() {
    return this.__value_names;
  }

  set children(options) {
    this.__children = options;
  }

  get children() {
    return this.__children;
  }

  hasChildren() {
    return this.__children.length > 0;
  }

  set value(value) {
    this.__value = value;
  }

  get value() {
    return this.__value;
  }

  set value_id(value_id) {
    this.__value_id = value_id;
  }

  get value_id() {
    return this.__value_id;
  }

  isCalculable() {
    return this.__children.length == 0;
  }

  equals(other) {
    if (!other || !(other instanceof Option)) {
      return false;
    }
    if (!(this.__id == other.id && this.__index == other.__index && this.__name == other.name && this.__parent_name == other.parent_name
    && JSON.stringify(this.__value_names) == JSON.stringify(other.value_names)
    && this.__value == other.value && this.__value_id == other.value_id)) {
      return false;
    };

    if (this.__children.length != other.children.length) {
      return false;
    }
    for (let i=0; i < this.__children.length; i++) {
      if (!this.__children[i].equals(other.children[i])) {
        return false;
      }
    }
    return true;
  }

  clone() {
    let new_value_names = JSON.parse(JSON.stringify(this.__value_names));
    let new_obj = new Option(this.__id, this.__name, new_value_names);
    new_obj.index = this.__index;
    new_obj.parent_name = this.__parent_name;
    new_obj.value = this.__value;
    if (this.__children) {
      let new_children = [];
      for (let i=0; i < this.__children.length; i++) {
        let child_option = this.__children[i];
        new_children.push(child_option.clone());
      }
      new_obj.children = new_children;
    }
    return new_obj;
  }
}
