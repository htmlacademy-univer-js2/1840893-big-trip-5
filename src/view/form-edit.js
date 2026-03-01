import Transport from './transport.js';
import Offer from './offer.js';
import dayjs from 'dayjs';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { getInitialPointState } from '../utils/utils.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';

function createFormEditTemplate(point, destinations) {
  const { type, destination, basePrice, dateFrom, dateTo, offers = [] } = point;
  const { description, pictures = [] } = destination;

  const formattedDateFrom = dayjs(dateFrom).format('DD/MM/YY HH:mm');
  const formattedDateTo = dayjs(dateTo).format('DD/MM/YY HH:mm');

  return `
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
          <div class="event__type-list">
            ${new Transport().template}
          </div>
        </div>

        <div class="event__field-group event__field-group--destination">
          <label class="event__label event__type-output" for="event-destination-1">
            ${type.charAt(0).toUpperCase() + type.slice(1)}
          </label>
          <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${he.encode(destination.name)}" list="destination-list-1">
          <datalist id="destination-list-1">
            ${destinations?.map((dest) => `
              <option value="${he.encode(dest.name)}"></option>
            `).join('') || ''}
          </datalist>
        </div>

        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formattedDateFrom}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formattedDateTo}">
        </div>

        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input event__input--price" id="event-price-1" type="number" min="0" name="event-price" value="${basePrice}">
        </div>

        <button class="event__save-btn btn btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Delete</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>

      <section class="event__details">
        <section class="event__section event__section--offers">
          <h3 class="event__section-title event__section-title--offers">Offers</h3>
          ${new Offer(offers).template}
        </section>

        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${he.encode(description)}</p>

          ${pictures ? `
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${pictures.map((picture) => `
                  <img class="event__photo" src="${he.encode(picture.src)}" alt="${he.encode(picture.description || 'Photo')}">
                `).join('')}
              </div>
            </div>
          ` : ''}
        </section>
      </section>
    </form>
  `;
}

export default class EditForm extends AbstractStatefulView {
  #onCloseButtonClick = null;
  #onSubmitButtonClick = null;
  #destinations = null;
  #offersByType = null;
  #dateFromPicker = null;
  #dateToPicker = null;
  #onDeleteButtonClick = null;

  constructor({ point, onCloseButtonClick, onSubmitButtonClick, destinations, offersByType, onDeleteButtonClick }) {
    super();
    this.#onCloseButtonClick = onCloseButtonClick;
    this.#onSubmitButtonClick = onSubmitButtonClick;
    this.#onDeleteButtonClick = onDeleteButtonClick;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
    this._setState(getInitialPointState(point));
    this._restoreHandlers();
  }

  get template() {
    return createFormEditTemplate(this._state, this.#destinations);
  }

  _restoreHandlers() {
    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    if (rollupBtn) {
      rollupBtn.addEventListener('click', this.#closeEditButtonClickHandler);
    }

    const form = this.element;
    form.addEventListener('submit', this.#submitButtonClickHandler);

    const deleteBtn = this.element.querySelector('.event__reset-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', this.#deleteButtonClickHandler);
    }

    const typeLabels = this.element.querySelectorAll('.event__type-label');
    typeLabels.forEach((label) => {
      label.addEventListener('click', this.#typeLabelClickHandler);
    });

    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('change', this.#destinationChangeHandler);
    }

    const priceInput = this.element.querySelector('#event-price-1');
    if (priceInput) {
      priceInput.addEventListener('change', this.#priceInputHandler);
    }

    this.#initDatepickers();
  }

  #initDatepickers() {
    if (this.#dateFromPicker) {
      this.#dateFromPicker.destroy();
    }
    if (this.#dateToPicker) {
      this.#dateToPicker.destroy();
    }
    this.#dateFromPicker = null;
    this.#dateToPicker = null;

    const dateFromInput = this.element.querySelector('#event-start-time-1');
    const dateToInput = this.element.querySelector('#event-end-time-1');

    if (dateFromInput) {
      this.#dateFromPicker = flatpickr(dateFromInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        // eslint-disable-next-line camelcase
        time_24hr: true,
        defaultDate: this._state.dateFrom || null,
        onChange: (selectedDates, dateStr) => {
          this.updateElement({
            dateFrom: dateStr
          });


          if (this.#dateToPicker && selectedDates[0]) {
            this.#dateToPicker.set('minDate', selectedDates[0]);
          }
        }
      });
    }

    if (dateToInput) {
      this.#dateToPicker = flatpickr(dateToInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        // eslint-disable-next-line camelcase
        time_24hr: true,
        defaultDate: this._state.dateTo || null,
        minDate: this._state.dateFrom || null,
        onChange: (_, dateStr) => {
          this.updateElement({
            dateTo: dateStr
          });
        }
      });
    }
  }

  removeElement() {
    if (this.#dateFromPicker) {
      this.#dateFromPicker.destroy();
    }
    if (this.#dateToPicker) {
      this.#dateToPicker.destroy();
    }
    this.#dateFromPicker = null;
    this.#dateToPicker = null;
    super.removeElement();
  }

  #typeLabelClickHandler = (evt) => {
    evt.preventDefault();

    const label = evt.currentTarget;
    const typeText = label.textContent.trim();
    const newType = typeText.toLowerCase();

    const offersForType = this.#offersByType.find((group) => group.type === newType);

    if (!offersForType) {
      return;
    }

    const newOffers = offersForType.offers.map((offer) => ({
      ...offer,
      selected: false
    }));

    this.updateElement({
      type: newType,
      offers: newOffers
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();

    const destinationName = evt.target.value;

    const selectedDestination = this.#destinations.find(
      (dest) => dest.name === destinationName
    );

    if (selectedDestination) {
      this.updateElement({
        destination: selectedDestination
      });
    }
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      basePrice: evt.target.value,
    });
  };

  #closeEditButtonClickHandler = (evt) => {
    evt.preventDefault();
    this.#onCloseButtonClick();
  };

  #submitButtonClickHandler = (evt) => {
    evt.preventDefault();
    const destinationInput = this.element.querySelector('.event__input--destination');
    const destinationName = destinationInput ? destinationInput.value : '';

    const selectedDestination = this.#destinations.find(
      (dest) => dest.name === destinationName,
    );

    if (!selectedDestination) {
      return;
    }

    const dateFromObj = dayjs(this._state.dateFrom);
    let dateToObj = dayjs(this._state.dateTo);
    const price = Number(this._state.basePrice);

    if (!price && price !== 0) {
      return;
    }

    const selectedOfferIds = (this._state.offers || [])
      .filter((offer) => offer.selected)
      .map((offer) => offer.id);

    if (!dateToObj.isAfter(dateFromObj)) {
      dateToObj = dateFromObj.add(1, 'minute');
    }

    const pointToSubmit = {
      ...this._state,
      id: this._state.id,
      destination: selectedDestination.id,
      dateFrom: dateFromObj.toISOString(),
      dateTo: dateToObj.toISOString(),
      basePrice: price,
      offers: selectedOfferIds,
    };

    this.#onSubmitButtonClick(pointToSubmit);
  };

  #deleteButtonClickHandler = (evt) => {
    evt.preventDefault();
    this.#onDeleteButtonClick();
  };
}
