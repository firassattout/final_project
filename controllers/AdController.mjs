import AdFacade from "../facade/AdFacade.mjs";

class AdController {
  constructor() {
    this.adFacade = new AdFacade();
  }

  async createAd(req, res) {
    try {
      const ad = await this.adFacade.createAd(req.body);
      res.status(201).json(ad);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAd(req, res) {
    try {
      const ad = await this.adFacade.getAd(req.params.id);
      res.json(ad);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllAds(req, res) {
    try {
      const ads = await this.adFacade.getAllActiveAds();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAd(req, res) {
    try {
      const ad = await this.adFacade.updateAd(req.params.id, req.body);
      res.json(ad);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteAd(req, res) {
    try {
      const ad = await this.adFacade.deleteAd(req.params.id);
      res.json(ad);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async trackClick(req, res) {
    try {
      const ad = await this.adFacade.trackAdClick(req.params.id);
      res.json(ad);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async trackImpression(req, res) {
    try {
      const ad = await this.adFacade.trackAdImpression(req.params.id);
      res.json(ad);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default AdController;
