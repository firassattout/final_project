import AdService from "../services/AdService.mjs";

class AdFacade {
  async createAd(adData) {
    return await AdService.createAd(adData);
  }
  async valueCheck(adData) {
    return await AdService.valueCheck(adData);
  }
  async editAd(adData) {
    return await AdService.editAd(adData);
  }
  async getAd(adData) {
    return await AdService.getAd(adData);
  }
  async addMedia(adData) {
    return await AdService.addMedia(adData);
  }
}

export default new AdFacade();
