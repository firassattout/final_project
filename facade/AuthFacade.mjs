import AuthService from "../services/authService.mjs";
import logger from "../utils/logger.mjs";

class AuthFacade {
  /**
   * Handle first registration
   * @param {Object} data - Registration data
   * @returns {Promise<Object>} Formatted response
   */
  async handleFirstRegister(data) {
    try {
      const result = await AuthService.firstRegister(data);
      return result;
    } catch (error) {
      logger.error(`First register error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Handle second registration
   * @param {Object} req - Request object
   * @returns {Promise<Object>} Formatted response
   */
  async handleSecondRegister(req) {
    try {
      const result = await AuthService.secondRegister(
        req.body,
        req.user,
        req.files
      );
      return result;
    } catch (error) {
      logger.error(`Second register error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Handle user login
   * @param {Object} req - Request object
   * @returns {Promise<Object>} Formatted response
   */
  async handleLogin(req) {
    try {
      const result = await AuthService.login(req.body, {
        ip: req.ip,
        device: req.get("user-agent"),
      });
      return result;
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Handle token refresh
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Formatted response
   */
  async handleRefreshToken(refreshToken) {
    try {
      const result = await AuthService.refreshAccessToken(refreshToken);
      return result;
    } catch (error) {
      logger.error(`Refresh token error: ${error.message}`);
      throw new Error(error.message);
    }
  }
}

export default new AuthFacade();
