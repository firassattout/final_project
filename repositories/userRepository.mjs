import { CompanyType } from "../models/CompanyTypeModel.mjs";
import { Users } from "../models/Users.mjs";
import logger from "../utils/logger.mjs";

class UserRepository {
  /**
   * Find user by email
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} User document or null
   */
  async findByEmail(email) {
    try {
      return await Users.findOne({ email }).lean();
    } catch (error) {
      logger.error(`Error finding user by email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data to create
   * @returns {Promise<Object>} Created user document
   */
  async create(userData, session) {
    try {
      const user = new Users(userData);
      return await user.save(session);
    } catch (error) {
      logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user by ID
   * @param {string} userId - User ID
   * @param {Object} data - Update data
   * @returns {Promise<Object|null>} Updated user document
   */
  async update(userId, data) {
    try {
      return await Users.findByIdAndUpdate(userId, data, { new: true }).lean();
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update refresh token
   * @param {string} userId - User ID
   * @param {string} refreshToken - New refresh token
   * @returns {Promise<Object|null>} Updated user document
   */
  async updateRefreshToken(userId, refreshToken) {
    return await Users.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User document with populated companyType
   */
  async findById(id) {
    try {
      return await Users.findById(id)
        .select("-loginHistory -twoFactorAuth -password -refreshToken")
        .populate("companyType", "name")
        .lean();
    } catch (error) {
      logger.error(`Error finding user by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find users by type and name
   * @param {string} type - User role
   * @param {string} name - User name (partial match)
   * @returns {Promise<Array>} Array of user documents
   */
  async findByType(type, name) {
    try {
      return await Users.find({
        ...(type && { role: type }),
        ...(name && { name: { $regex: name, $options: "i" } }),
      })
        .select("-loginHistory -password -refreshToken -updatedAt -createdAt")
        .populate("companyType", "name")
        .lean();
    } catch (error) {
      logger.error(`Error finding users by type: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all company types
   * @returns {Promise<Array>} Array of company type documents
   */
  async findCompanyType() {
    try {
      return await CompanyType.find().lean();
    } catch (error) {
      logger.error(`Error finding company types: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update login data
   * @param {string} userId - User ID
   * @param {string} refreshToken - New refresh token
   * @param {Object} loginData - Login metadata
   * @returns {Promise<Object|null>} Updated user document
   */
  async updateLoginData(userId, refreshToken, loginData = {}) {
    try {
      return await Users.findByIdAndUpdate(
        userId,
        {
          $set: {
            refreshToken,
            refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            lastLogin: Date.now(),
          },
          $push: {
            loginHistory: {
              ip: loginData.ip || "unknown",
              device: loginData.device || "unknown",
              timestamp: Date.now(),
            },
          },
        },
        { new: true }
      )
        .select("-password -verificationCode -resetPasswordToken")
        .lean();
    } catch (error) {
      logger.error(`Error updating login data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deactivate user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Updated user document
   */
  async deactivateUser(userId) {
    try {
      return await Users.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      ).lean();
    } catch (error) {
      logger.error(`Error deactivating user: ${error.message}`);
      throw error;
    }
  }
  /**
   * activate user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Updated user document
   */
  async activateUser(userId) {
    try {
      return await Users.findByIdAndUpdate(
        userId,
        { isActive: true },
        { new: true }
      ).lean();
    } catch (error) {
      logger.error(`Error activating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Count users by role
   * @param {string} role - User role
   * @returns {Promise<number>} Number of users with role
   */
  async countUsersByRole(role) {
    try {
      return await Users.countDocuments({ role });
    } catch (error) {
      logger.error(`Error counting users by role: ${error.message}`);
      throw error;
    }
  }
}

export default new UserRepository();
