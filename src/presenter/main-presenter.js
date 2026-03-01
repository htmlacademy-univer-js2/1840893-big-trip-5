import ListPresenter from './list-presenter.js';
import TripInfo from '../view/trip-info.js';
import { render, RenderPosition } from '../framework/render.js';
import CreateForm from '../view/form-create.js';

export default class MainPresenter {
  #boardContainer = null;
  #headerContainer = null;
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #listPresenter = null;
  #filterModel = null;
  #createFormComponent = null;
  #newEventButton = null;

  constructor({
    boardContainer,
    headerContainer,
    pointsModel,
    destinationsModel,
    offersModel,
    filterModel,
  }) {
    this.#boardContainer = boardContainer;
    this.#headerContainer = headerContainer;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;

    this.#filterModel.addObserver(this.#handleModelChange);
  }

  init() {
    /* Header */
    render(new TripInfo(), this.#headerContainer, RenderPosition.AFTERBEGIN);

    /* New Event Button */
    this.#newEventButton = document.querySelector('.trip-main__event-add-btn');
    this.#newEventButton.addEventListener('click', this.#handleNewEventClick);

    this.#listPresenter = new ListPresenter({
      boardContainer: this.#boardContainer,
      pointsModel: this.#pointsModel,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      filterModel: this.#filterModel,
      onCloseCreateForm: () => this.closeCreateForm(),
    });

    this.#listPresenter.init();
  }

  closeCreateForm() {
    if (this.#createFormComponent) {
      this.#createFormComponent.element.remove();
      this.#createFormComponent = null;
      this.#newEventButton.disabled = false;
    }
  }

  #handleNewEventClick = () => {
    if (this.#createFormComponent) {
      return;
    }

    this.#filterModel.filter = 'everything';

    this.#listPresenter.resetSort();

    this.#listPresenter.setViewState({ isCreating: true });

    this.#createFormComponent = new CreateForm({
      destinations: this.#destinationsModel.destinations,
      offersByType: this.#offersModel.offers,
      onSubmitButtonClick: this.#handleCreateSubmit,
      onCancelButtonClick: this.#handleCreateCancel,
    });

    render(
      this.#createFormComponent,
      this.#boardContainer,
      RenderPosition.AFTERBEGIN,
    );

    this.#newEventButton.disabled = true;
  };

  #handleCreateSubmit = (point) => {
    this.#pointsModel.addPoint(point);
    this.#handleCreateCancel();
  };

  #handleCreateCancel = () => {
    if (this.#createFormComponent) {
      this.#createFormComponent.element.remove();
      this.#createFormComponent = null;
    }
    this.#newEventButton.disabled = false;
    this.#listPresenter.setViewState({ isCreating: false });
  };

  #handleModelChange = () => {
    this.#listPresenter.resetSort();
    this.#listPresenter.init();
  };
}
