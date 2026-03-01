import Observable from '../framework/observable.js';
import { UPDATE_TYPE } from '../constants/constants.js';

export default class FilterModel extends Observable {
  #filter = 'everything';

  get filter() {
    return this.#filter;
  }

  set filter(filter) {
    this.#filter = filter;
    this._notify(UPDATE_TYPE.MAJOR, this.#filter);
  }
}
