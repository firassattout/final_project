import { t } from "i18next";
import MerchantService from "../services/MerchantService.mjs";

import logger from "../utils/logger.mjs";

class MerchantFacade {
  /**
   * Create a new merchant application
   * @param {Object} data - Merchant application data
   * @returns {Promise<Object>} Formatted response
   */
  async createMerchantApp(data) {
    try {
      const result = await MerchantService.createMerchantApp(data);
      return result;
    } catch (error) {
      logger.error(`Create merchant application error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }
  /**
   * get merchant application
   * @returns {Promise<Object>} Formatted response
   */
  async getMerchantApp(data) {
    try {
      const result = await MerchantService.getMerchantApp(data);
      return result;
    } catch (error) {
      logger.error(`Create merchant application error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }
}

export default new MerchantFacade();
