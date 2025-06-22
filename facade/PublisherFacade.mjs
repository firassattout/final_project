import PublisherService from "../services/PublisherService.mjs";
import logger from "../utils/logger.mjs";
import { t } from "i18next";

class PublisherFacade {
  /**
   * Generate embed code
   * @param {Object} data - Embed data
   * @returns {Promise<Object>} Formatted response
   */
  async embed(data) {
    try {
      const result = await PublisherService.embed(data);
      return result;
    } catch (error) {
      logger.error(`Embed error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }

  /**
   * Track advertisement views
   * @param {Object} data - View tracking data
   * @returns {Promise<Object>} Formatted response
   */
  async trackViews(data) {
    try {
      const result = await PublisherService.trackViews(data);
      return result;
    } catch (error) {
      logger.error(`Track views error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }

  /**
   * Track advertisement clicks
   * @param {Object} data - Click tracking data
   * @returns {Promise<Object>} Formatted response
   */
  async trackClick(data) {
    try {
      const result = await PublisherService.trackClick(data);
      return result;
    } catch (error) {
      logger.error(`Track click error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }

  /**
   * Show advertisement
   * @param {Object} data - Ad display data
   * @returns {Promise<Object>} Formatted response
   */
  async showAd(data) {
    try {
      const result = await PublisherService.showAd(data);
      return result;
    } catch (error) {
      logger.error(`Show ad error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }
}

export default new PublisherFacade();
