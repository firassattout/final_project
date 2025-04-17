import AdRepository from "../repositories/AdRepository.mjs";

class AdService {
  constructor() {
    this.adRepository = new AdRepository();
  }

  async createAd(adData) {
    return this.adRepository.create(adData);
  }

  async getAdById(id) {
    return this.adRepository.findById(id);
  }

  async getAllAds() {
    return this.adRepository.findAll();
  }

  async updateAd(id, adData) {
    return this.adRepository.update(id, adData);
  }

  async deleteAd(id) {
    return this.adRepository.delete(id);
  }

  async trackClick(id) {
    return this.adRepository.incrementClicks(id);
  }

  async trackImpression(id) {
    return this.adRepository.incrementImpressions(id);
  }
}

export default AdService;
