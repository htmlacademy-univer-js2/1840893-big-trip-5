export default class OffersModel {
  #offers = [];
  #apiService = null;

  constructor({ apiService }) {
    this.#apiService = apiService;
  }

  get offers() {
    return this.#offers;
  }

  async init() {
    try {
      this.#offers = await this.#apiService.offers;
    } catch {
      this.#offers = [];
    }
  }

  getOffersByType(type) {
    return this.#offers.find((group) => group.type === type);
  }

  getOffersWithSelected(point) {
    const offersForType = this.getOffersByType(point.type);
    const allOffers = offersForType ? offersForType.offers : [];

    const selectedIds = Array.isArray(point.offers)
      ? point.offers.map((selectedOffer) =>
        typeof selectedOffer === 'object' ? selectedOffer.id : selectedOffer,
      )
      : [];

    return allOffers.map((offer) => ({
      ...offer,
      selected: selectedIds.includes(offer.id),
    }));
  }
}
