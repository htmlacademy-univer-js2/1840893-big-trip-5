export default class DestinationsModel {
  #destinations = [];
  #apiService = null;

  constructor({ apiService }) {
    this.#apiService = apiService;
  }

  get destinations() {
    return this.#destinations;
  }

  async init() {
    try {
      this.#destinations = await this.#apiService.destinations;
    } catch {
      this.#destinations = [];
    }
  }
}
