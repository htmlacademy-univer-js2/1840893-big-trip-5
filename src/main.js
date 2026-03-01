import ApiClient from './api/api-client.js';
import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import MainPresenter from './presenter/main-presenter.js';
import Message from './view/message.js';
import { render } from './framework/render.js';
import {
  AUTHORIZATION,
  END_POINT,
  LOADING_MESSAGE,
} from './constants/constants.js';

const apiClient = new ApiClient(END_POINT, AUTHORIZATION);

const pointsModel = new PointsModel({ pointsApiService: apiClient });
const destinationsModel = new DestinationsModel({ apiService: apiClient });
const offersModel = new OffersModel({ apiService: apiClient });
const filterModel = new FilterModel();

/* Header */
const siteHeaderElement = document.querySelector('.trip-main');

/* Main page */
const siteMainElement = document.querySelector('.trip-events');

const newEventButton = document.querySelector('.trip-main__event-add-btn');

const loadingMessage = new Message({ message: LOADING_MESSAGE });
render(loadingMessage, siteMainElement);

const filterPresenter = new FilterPresenter({
  headerContainer: siteHeaderElement,
  pointsModel,
  filterModel,
});

const mainPresenter = new MainPresenter({
  boardContainer: siteMainElement,
  headerContainer: siteHeaderElement,
  pointsModel,
  destinationsModel,
  offersModel,
  filterModel,
});

newEventButton.disabled = true;

filterPresenter.init();

Promise.all([
  pointsModel.init(),
  destinationsModel.init(),
  offersModel.init(),
]).finally(() => {
  loadingMessage.element.remove();
  mainPresenter.init();
  newEventButton.disabled = false;
});
