import AdvertiserService from "../services/AdvertiserService.mjs";

class AdvertiserFacade {
  async createAd(adData) {
    return await AdvertiserService.createAd(adData);
  }
  async valueCheck(adData) {
    return await AdvertiserService.valueCheck(adData);
  }
  async editAd(adData) {
    return await AdvertiserService.editAd(adData);
  }
  async getAd(adData) {
    return await AdvertiserService.getAd(adData);
  }
  async getMedia(adData) {
    return await AdvertiserService.getMedia(adData);
  }
  async addMedia(adData) {
    return await AdvertiserService.addMedia(adData);
  }
}

export default new AdvertiserFacade();
