import PublisherService from "../services/PublisherService.mjs";

class PublisherFacade {
  async embed(adData) {
    return await PublisherService.embed(adData);
  }
  async rewardedComplete(adData) {
    return await PublisherService.rewardedComplete(adData);
  }
  async trackClick(adData) {
    return await PublisherService.trackClick(adData);
  }
  async showAd(adData) {
    return await PublisherService.showAd(adData);
  }
}

export default new PublisherFacade();
