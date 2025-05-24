import AnalyticService from "../services/AnalyticService.mjs";

class AnalyticFacade {
  async publisherAnalytics(req) {
    return await AnalyticService.publisherAnalytics(req);
  }

  async advertiserAnalytics(req) {
    return await AnalyticService.advertiserAnalytics(req);
  }

  async adminAnalytics(req) {
    return await AnalyticService.adminAnalytics(req);
  }
}

export default new AnalyticFacade();
