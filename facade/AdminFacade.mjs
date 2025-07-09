import AdminService from "../services/adminService.mjs";
import AdvertiserService from "../services/AdvertiserService.mjs";
import logger from "../utils/logger.mjs";

class AdminFacade {
  /**
   * Handle user deactivation
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Formatted response
   */
  async handleDeactivation(params) {
    try {
      const result = await AdminService.userDeactivation(params.id);
      return result;
    } catch (error) {
      logger.error(`Deactivation error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Get users
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Formatted response
   */
  async getUser(params) {
    try {
      const result = await AdminService.getUser(params.type, params.name);
      return result;
    } catch (error) {
      logger.error(`Get user error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Get company types
   * @returns {Promise<Object>} Formatted response
   */
  async getCompanyType() {
    try {
      const result = await AdminService.getCompanyType();
      return result;
    } catch (error) {
      logger.error(`Get company type error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Get advertisements
   * @param {Object} data - Ad retrieval data
   * @returns {Promise<Object>} Formatted response
   */
  async getAd(data) {
    try {
      const result = await AdminService.getAd(data);
      return result;
    } catch (error) {
      logger.error(`Get ad error: ${error.message}`);
      throw error;
    }
  }

  /**
   * get One User
   * @param {Object} data - Ad retrieval data
   * @returns {Promise<Object>} Formatted response
   */
  async getOneUser(data) {
    try {
      const result = await AdminService.getOneUser(data);
      return result;
    } catch (error) {
      logger.error(`Get ad error: ${error.message}`);
      throw error;
    }
  }
  /**
   * @param {Object} data - adId addition data
   * @returns {Promise<Object>} Formatted response
   */
  async changeStateAd(data) {
    try {
      const result = await AdminService.changeStateAd(data);
      return result;
    } catch (error) {
      logger.error(`change State Ad error: ${error.message}`);
      throw error;
    }
  }
}

export default new AdminFacade();
