import { AdMedia } from "../models/AdMediaModel.mjs";
import { Ads } from "../models/AdModel.mjs";
import logger from "../utils/logger.mjs";
import { isValidObjectId } from "mongoose";
import { t } from "i18next";

class AdRepository {
  /**
   * Create a new advertisement
   * @param {Object} adData - Advertisement data
   * @returns {Promise<Object>} Created ad document
   * @throws {Error} If creation fails
   */
  async create(adData) {
    try {
      const ad = new Ads(adData);
      const savedAd = await ad.save();
      logger.info(`Ad created: ${savedAd._id}`);
      return savedAd;
    } catch (error) {
      logger.error(`Error creating ad: ${error.message}`);
      throw new Error(t("ad.creation_failed"));
    }
  }

  /**
   * Find an advertisement by ID
   * @param {string} id - Advertisement ID
   * @returns {Promise<Object|null>} Ad document or null
   * @throws {Error} If ID is invalid or query fails
   */
  async findById(id) {
    if (!isValidObjectId(id)) {
      logger.warn(`Invalid ad ID: ${id}`);
      throw new Error(t("ad.invalid_id"));
    }
    try {
      const ad = await Ads.findById(id).lean();
      if (!ad) {
        logger.warn(`Ad not found: ${id}`);
        return null;
      }
      logger.info(`Ad retrieved: ${id}`);
      return ad;
    } catch (error) {
      logger.error(`Error finding ad by ID: ${error.message}`);
      throw new Error(t("ad.find_failed"));
    }
  }

  /**
   * Find all advertisement media with populated ad data
   * @returns {Promise<Array>} Array of media documents
   * @throws {Error} If query fails
   */
  async findAllMedia() {
    try {
      const media = await AdMedia.find()
        .populate({
          path: "adId",
          select: "-__v -createdAt -updatedAt",
        })
        .lean();
      logger.info(`Retrieved ${media.length} media items`);
      return media;
    } catch (error) {
      logger.error(`Error finding all media: ${error.message}`);
      throw new Error(t("ad.media_find_failed"));
    }
  }

  /**
   * Find advertisements by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of ad documents
   * @throws {Error} If ID is invalid or query fails
   */
  async findByUser(userId, adId) {
    if (!isValidObjectId(userId)) {
      logger.warn(`Invalid user ID: ${userId}`);
      throw new Error(t("ad.invalid_user_id"));
    }
    if (adId && !isValidObjectId(adId)) {
      logger.warn(`Invalid ad ID: ${adId}`);
      throw new Error(t("ad.invalid_id"));
    }

    try {
      let query = { userId };
      if (adId) {
        query._id = adId;
      }

      const ads = await Ads.find(query)
        .select("-__v -mediaFolder") // Exclude sensitive/unneeded fields
        .lean();

      if (adId) {
        if (!ads.length) {
          logger.warn(`Ad not found: ${adId} for user: ${userId}`);
          return null;
        }
        logger.info(`Retrieved ad: ${adId} for user: ${userId}`);
        return ads[0]; // Return single ad object
      }

      logger.info(`Retrieved ${ads.length} ads for user: ${userId}`);
      return ads; // Return array of ads
    } catch (error) {
      logger.error(`Error finding ads by user: ${error.message}`);
      throw new Error(t("ad.find_by_user_failed"));
    }
  }

  /**
   * Find media by advertisement ID
   * @param {string} adId - Advertisement ID
   * @returns {Promise<Object|null>} Media document or null
   * @throws {Error} If ID is invalid or query fails
   */
  async findMedia(adId) {
    if (!isValidObjectId(adId)) {
      logger.warn(`Invalid ad ID for media: ${adId}`);
      throw new Error(t("ad.invalid_id"));
    }
    try {
      const media = await AdMedia.findOne({ adId })
        .populate({
          path: "adId",
          select: "title type platform state",
        })
        .lean();
      if (!media) {
        logger.warn(`Media not found for ad: ${adId}`);
        return null;
      }
      logger.info(`Media retrieved for ad: ${adId}`);
      return media;
    } catch (error) {
      logger.error(`Error finding media by ad ID: ${error.message}`);
      throw new Error(t("ad.media_find_failed"));
    }
  }

  /**
   * Update an advertisement
   * @param {string} id - Advertisement ID
   * @param {Object} adData - Update data
   * @returns {Promise<Object|null>} Updated ad document
   * @throws {Error} If ID is invalid or update fails
   */
  async edit(id, adData) {
    if (!isValidObjectId(id)) {
      logger.warn(`Invalid ad ID for edit: ${id}`);
      throw new Error(t("ad.invalid_id"));
    }
    try {
      const updatedAd = await Ads.findByIdAndUpdate(
        id,
        {
          $set: {
            ...adData,
            updatedAt: new Date(),
          },
        },
        { new: true }
      ).lean();
      if (!updatedAd) {
        logger.warn(`Ad not found for update: ${id}`);
        return null;
      }
      logger.info(`Ad updated: ${id}`);
      return updatedAd;
    } catch (error) {
      logger.error(`Error updating ad: ${error.message}`);
      throw new Error(t("ad.update_failed"));
    }
  }
}

export default new AdRepository();
