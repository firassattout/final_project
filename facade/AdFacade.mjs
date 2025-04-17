import AdService from "../services/AdService.mjs";

class AdFacade {
  constructor() {
    this.adService = new AdService();
  }

  async createAd(adData) {
    try {
      const requiredFields = ["title", "content", "imageUrl", "targetUrl"];
      const missingFields = requiredFields.filter((field) => !adData[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      return await this.adService.createAd(adData);
    } catch (error) {
      console.error("Error in AdFacade.createAd:", error);
      throw error;
    }
  }

  async getAd(id) {
    try {
      const ad = await this.adService.getAdById(id);
      if (!ad) {
        throw new Error("Ad not found");
      }
      return ad;
    } catch (error) {
      console.error("Error in AdFacade.getAd:", error);
      throw error;
    }
  }

  async getAllActiveAds() {
    try {
      return await this.adService.getAllAds();
    } catch (error) {
      console.error("Error in AdFacade.getAllActiveAds:", error);
      throw error;
    }
  }

  async updateAd(id, adData) {
    try {
      const ad = await this.adService.updateAd(id, adData);
      if (!ad) {
        throw new Error("Ad not found");
      }
      return ad;
    } catch (error) {
      console.error("Error in AdFacade.updateAd:", error);
      throw error;
    }
  }

  async deleteAd(id) {
    try {
      const ad = await this.adService.deleteAd(id);
      if (!ad) {
        throw new Error("Ad not found");
      }
      return ad;
    } catch (error) {
      console.error("Error in AdFacade.deleteAd:", error);
      throw error;
    }
  }

  async trackAdClick(id) {
    try {
      const ad = await this.adService.trackClick(id);
      if (!ad) {
        throw new Error("Ad not found");
      }
      return ad;
    } catch (error) {
      console.error("Error in AdFacade.trackAdClick:", error);
      throw error;
    }
  }

  async trackAdImpression(id) {
    try {
      const ad = await this.adService.trackImpression(id);
      if (!ad) {
        throw new Error("Ad not found");
      }
      return ad;
    } catch (error) {
      console.error("Error in AdFacade.trackAdImpression:", error);
      throw error;
    }
  }
}

export default AdFacade;
