import Point from '../view/point.js';
import EditForm from '../view/form-edit.js';
import BoardItem from '../view/board-item.js';
import { render, replace, remove } from '../framework/render.js';
import { USER_ACTION } from '../constants/constants.js';

export default class PointPresenter {
  #container = null;
  #point = null;
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;

  #boardItem = null;
  #pointComponent = null;
  #editFormComponent = null;
  #onViewChange = null;
  #onDataChange = null;
  #isEditing = false;
  #uiBlocker = null;

  constructor({
    container,
    point,
    pointsModel,
    destinationsModel,
    offersModel,
    uiBlocker,
    onViewChange,
    onDataChange,
  }) {
    this.#container = container;
    this.#point = point;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#uiBlocker = uiBlocker;
    this.#onViewChange = onViewChange;
    this.#onDataChange = onDataChange;
  }

  init() {
    if (this.#boardItem !== null) {
      return;
    }

    this.#boardItem = new BoardItem();
    render(this.#boardItem, this.#container);

    const destination =
      this.#destinationsModel.destinations.find(
        (item) => item.id === this.#point.destination,
      ) || {
        id: this.#point.destination,
        name: '',
        description: '',
        pictures: [],
      };

    const pointWithOffers = {
      ...this.#point,
      destination,
      offers: this.#offersModel.getOffersWithSelected(this.#point),
    };

    this.#pointComponent = new Point({
      point: pointWithOffers,
      onOpenButtonClick: this.#replacePointToEdit,
      onFavoriteClick: this.#toggleFavorite,
    });

    this.#editFormComponent = new EditForm({
      point: pointWithOffers,
      onCloseButtonClick: this.#replaceEditToPoint,
      onSubmitButtonClick: this.#handleFormSubmit,
      onDeleteButtonClick: this.#handleDeleteClick,
      destinations: this.#destinationsModel.destinations,
      offersByType: this.#offersModel.offers,
    });

    render(this.#pointComponent, this.#boardItem.element);
  }

  destroy() {
    if (this.#boardItem) {
      remove(this.#boardItem);
      this.#boardItem = null;
    }

    this.#isEditing = false;
    this.#pointComponent = null;
    this.#editFormComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  updatePoint(updatedPoint) {
    this.#point = updatedPoint;
    const destination =
      this.#destinationsModel.destinations.find(
        (item) => item.id === this.#point.destination,
      ) || {
        id: this.#point.destination,
        name: '',
        description: '',
        pictures: [],
      };

    const pointWithOffers = {
      ...this.#point,
      destination,
      offers: this.#offersModel.getOffersWithSelected(this.#point),
    };

    const newPointComponent = new Point({
      point: pointWithOffers,
      onOpenButtonClick: this.#replacePointToEdit,
      onFavoriteClick: this.#toggleFavorite,
    });

    if (this.#isEditing) {
      this.#pointComponent = newPointComponent;
    } else {
      replace(newPointComponent, this.#pointComponent);
      this.#pointComponent = newPointComponent;
    }
  }

  resetView() {
    if (this.#isEditing) {
      this.#replaceEditToPoint();
    }
  }

  #toggleFavorite = async () => {
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite,
    };

    this.#uiBlocker.block();
    try {
      await this.#onDataChange(USER_ACTION.UPDATE_POINT, updatedPoint);
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleDeleteClick = async () => {
    this.#uiBlocker.block();
    this.#editFormComponent.setDeleting(true);
    try {
      await this.#onDataChange(USER_ACTION.DELETE_POINT, this.#point);
    } catch {
      this.#editFormComponent?.shake();
    } finally {
      if (this.#isEditing) {
        this.#editFormComponent.setDeleting(false);
      }
      this.#uiBlocker.unblock();
    }
  };

  #handleFormSubmit = async (updatedPoint) => {
    this.#uiBlocker.block();
    this.#editFormComponent.setSaving(true);
    try {
      await this.#onDataChange(USER_ACTION.UPDATE_POINT, updatedPoint);
      this.#editFormComponent.setSaving(false);
      this.#replaceEditToPoint();
    } catch {
      this.#editFormComponent.shake();
    } finally {
      if (this.#isEditing) {
        this.#editFormComponent.setSaving(false);
      }
      this.#uiBlocker.unblock();
    }
  };

  #replacePointToEdit = () => {
    if (this.#onViewChange) {
      this.#onViewChange();
    }
    replace(this.#editFormComponent, this.#pointComponent);
    this.#isEditing = true;
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #replaceEditToPoint = () => {
    replace(this.#pointComponent, this.#editFormComponent);
    this.#isEditing = false;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceEditToPoint();
    }
  };
}
