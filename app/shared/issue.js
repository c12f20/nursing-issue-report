'use strict';

class Issue {
  constructor(issue_id, options_id_array) {
    this.issue_id = issue_id;
    if (options_id_array) {
      this.options = {};
      for (let i = 0; i < options_id_array.length; i++) {
        this.options[options_id_array[i]] = null;
      }
    }
    this.creation_time = 0;
  }

  setOptionValue(option_id, value) {
    if (!(option_id in this.options)) {
      console.warn(`Failed to set Option value, option ${option_id} isn't in issue ${this.issue_id}`);
      return;
    }
    this.options[option_id] = value;
  }

  get issue_id() {
    return this.issue_id;
  }

  get options() {
    return this.options;
  }

  get option_values() {
    return JSON.stringify(this.options);
  }

  set creation_time(time) {
    this.creation_time = time;
  }

  get creation_time() {
    return this.creation_time;
  }
}
