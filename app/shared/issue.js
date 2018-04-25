'use strict';

class Issue {
  constructor(issue_id, options_id_array) {
    this.__issue_id = issue_id;
    if (options_id_array) {
      this.__options = {};
      for (let i = 0; i < options_id_array.length; i++) {
        this.__options[options_id_array[i]] = null;
      }
    }
    this.__creation_time = 0;
  }

  setOptionValue(option_id, value) {
    if (!(option_id in this.__options)) {
      console.warn(`Failed to set Option value, option ${option_id} isn't in issue ${this.__issue_id}`);
      return;
    }
    this.__options[option_id] = value;
  }

  get issue_id() {
    return this.__issue_id;
  }

  get options() {
    return this.__options;
  }

  get option_values() {
    return JSON.stringify(this.__options);
  }
}
