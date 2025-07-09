import AdvertiserService from "../services/AdvertiserService.mjs";
import logger from "../utils/logger.mjs";

class AdvertiserFacade {
  /**
   * Create a new advertisement
   * @param {Object} data - Ad creation data
   * @returns {Promise<Object>} Formatted response
   */
  async createAd(data) {
    try {
      const result = await AdvertiserService.createAd(data);
      return result;
    } catch (error) {
      logger.error(`Create ad error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check advertisement value
   * @param {Object} data - Value check data
   * @returns {Promise<Object>} Formatted response
   */
  async valueCheck(data) {
    try {
      const result = await AdvertiserService.valueCheck(data);
      return result;
    } catch (error) {
      logger.error(`Value check error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Edit an advertisement
   * @param {Object} data - Ad edit data
   * @returns {Promise<Object>} Formatted response
   */
  async editAd(data) {
    try {
      const result = await AdvertiserService.editAd(data);
      return result;
    } catch (error) {
      logger.error(`Edit ad error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get advertisements
   * @param {Object} data - Ad retrieval data
   * @returns {Promise<Object>} Formatted response
   */
  async getAd(data) {
    try {
      const result = await AdvertiserService.getAd(data);
      return result;
    } catch (error) {
      logger.error(`Get ad error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get media for an advertisement
   * @param {Object} data - Media retrieval data
   * @returns {Promise<Object>} Formatted response
   */
  async getMedia(data) {
    try {
      const result = await AdvertiserService.getMedia(data);
      return result;
    } catch (error) {
      logger.error(`Get media error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add media to an advertisement
   * @param {Object} data - Media addition data
   * @returns {Promise<Object>} Formatted response
   */
  async addMedia(data) {
    try {
      const result = await AdvertiserService.addMedia(data);
      return result;
    } catch (error) {
      logger.error(`Add media error: ${error.message}`);
      throw error;
    }
  }
  /**
   * @param {Object} data - adId addition data
   * @returns {Promise<Object>} Formatted response
   */
  async changeStateAd(data) {
    try {
      const result = await AdvertiserService.changeStateAd(data);
      return result;
    } catch (error) {
      logger.error(`change State Ad error: ${error.message}`);
      throw error;
    }
  }
}

export default new AdvertiserFacade();
