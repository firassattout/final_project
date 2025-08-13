import { t } from "i18next";
import PaymentService from "../services/PaymentService.mjs";

import logger from "../utils/logger.mjs";

class PaymentFacade {
  /**
   * Create a new merchant application
   * @param {Object} data - Merchant application data
   * @returns {Promise<Object>} Formatted response
   */
  async createMerchantApp(data) {
    try {
      const result = await PaymentService.createMerchantApp(data);
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
      const result = await PaymentService.getMerchantApp(data);
      return result;
    } catch (error) {
      logger.error(`Create merchant application error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }
  /**
   * delete merchant application
   * @returns {Promise<Object>} Formatted response
   */
  async deleteMerchantApp(data) {
    try {
      const result = await PaymentService.deleteMerchantApp(data);
      return result;
    } catch (error) {
      logger.error(`Create merchant application error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }

  /**
   * get transaction
   * @returns {Promise<Object>} Formatted response
   */
  async getTransactionByProgram(data) {
    try {
      const result = await PaymentService.getTransactionByProgram(data);
      return result;
    } catch (error) {
      logger.error(`Create transaction error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }
  /**
   * get transaction
   * @returns {Promise<Object>} Formatted response
   */
  async getTransaction(data) {
    try {
      const result = await PaymentService.getTransaction(data);
      return result;
    } catch (error) {
      logger.error(`Create transaction error: ${error.message}`);
      throw new Error(t(error.message));
    }
  }
}

export default new PaymentFacade();
