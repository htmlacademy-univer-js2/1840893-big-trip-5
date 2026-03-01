import ApiService from '../framework/api-service.js';
import { METHODS } from '../constants/constants.js';
import dayjs from 'dayjs';

export default class PointsApiService extends ApiService {
  get points() {
    return this._load({ url: 'points' })
      .then(ApiService.parseResponse)
      .then((points) => points.map((point) => this.#adaptToClient(point)));
  }

  get offers() {
    return this._load({ url: 'offers' }).then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({ url: 'destinations' }).then(ApiService.parseResponse);
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: METHODS.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return this.#adaptToClient(parsedResponse);
  }

  #adaptToClient(point) {
    return {
      id: point.id,
      type: point.type,
      destination: point.destination,
      basePrice: point['base_price'],
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      isFavorite: point['is_favorite'],
      offers: point.offers,
    };
  }

  #adaptToServer(point) {
    return {
      id: point.id,
      type: point.type,
      destination: point.destination,
      'base_price': point.basePrice,
      'date_from': point.dateFrom
        ? dayjs(point.dateFrom).toISOString()
        : null,
      'date_to': point.dateTo
        ? dayjs(point.dateTo).toISOString()
        : null,
      'is_favorite': point.isFavorite,
      offers: point.offers ?? [],
    };
  }
}
