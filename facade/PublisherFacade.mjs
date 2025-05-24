import PublisherService from "../services/PublisherService.mjs";

class PublisherFacade {
  async embed(adData) {
    return await PublisherService.embed(adData);
  }
  async trackViews(adData) {
    return await PublisherService.trackViews(adData);
  }
  async trackClick(adData) {
    return await PublisherService.trackClick(adData);
  }
  async showAd(adData) {
    return await PublisherService.showAd(adData);
  }
}

export default new PublisherFacade();
