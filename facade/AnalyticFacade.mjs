import AnalyticService from "../services/AnalyticService.mjs";
import logger from "../utils/logger.mjs";
import { t } from "i18next";

class AnalyticFacade {
  /**
   * Get publisher analytics
   * @param {Object} data - Analytics data
   * @returns {Promise<Object>} Formatted response
   */
  async publisherAnalytics(data) {
    try {
      const result = await AnalyticService.publisherAnalytics(data);
      return result;
    } catch (error) {
      logger.error(`Publisher analytics error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }

  /**
   * Get advertiser analytics
   * @param {Object} data - Analytics data
   * @returns {Promise<Object>} Formatted response
   */
  async advertiserAnalytics(data) {
    try {
      const result = await AnalyticService.advertiserAnalytics(data);
      return result;
    } catch (error) {
      logger.error(`Advertiser analytics error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }

  /**
   * Get admin analytics
   * @param {Object} data - Analytics data
   * @returns {Promise<Object>} Formatted response
   */
  async adminAnalytics(data) {
    try {
      const result = await AnalyticService.adminAnalytics(data);
      return result;
    } catch (error) {
      logger.error(`Admin analytics error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }
}

export default new AnalyticFacade();
