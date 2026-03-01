import Filter from '../view/filter.js';
import { render } from '../framework/render.js';

export default class FilterPresenter {
  #filterComponent = null;
  #headerContainer = null;
  #pointsModel = null;
  #filterModel = null;

  constructor({ headerContainer, pointsModel, filterModel }) {
    this.#headerContainer = headerContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#pointsModel.addObserver(this.#handleModelChange);
    this.#filterModel.addObserver(this.#handleModelChange);
  }

  init() {
    this.#renderFilters();
  }

  #renderFilters() {
    if (this.#filterComponent) {
      this.#filterComponent.element.remove();
    }

    this.#filterComponent = new Filter({
      currentFilter: this.#filterModel.filter,
      onFilterChange: (filterType) => {
        this.#filterModel.filter = filterType;
      },
    });

    render(this.#filterComponent, this.#headerContainer);
    this.#filterComponent.setFilterChangeHandler();
  }

  #handleModelChange = () => {
    this.#renderFilters();
  };
}
