import AdRepository from "../repositories/AdRepository.mjs";
import MediaRepository from "../repositories/MediaRepository.mjs";
import userRepository from "../repositories/userRepository.mjs";
import { createFolder } from "../config/createFileForGroup.mjs";
import { uploadFile } from "../config/uploadFiles.mjs";
import { basePrices, platformFactors } from "../utils/price.js";
import {
  validateAddMedia,
  validateCreateAd,
  validateEditAd,
  validateValueCheck,
} from "../utils/validation.js";
import { validateImage } from "../utils/photoSize.mjs";
import logger from "../utils/logger.mjs";
import { t } from "i18next";

class AdvertiserService {
  /**
   * Create a new advertisement
   * @param {Object} data - Ad creation data
   * @returns {Promise<Object>} Created ad
   */
  async createAd(data) {
    const { error } = validateCreateAd(data.body);
    if (error) throw new Error(t(error.details[0].message));

    const { startDate, endDate, pricingModel, url, title, type, platform } =
      data.body;
    const { userIdFromToken } = data;
    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error(t("ad.invalid_dates"));
    }

    if (!userIdFromToken) {
      throw new Error(t("ad.no_user_id"));
    }

    const user = await userRepository.findById(userIdFromToken);
    if (!user) {
      throw new Error(t("ad.user_not_found"));
    }

    if (pricingModel === "CPC" && !url) {
      throw new Error(t("ad.url_required"));
    }

    const basePrice = basePrices[pricingModel][type];
    const platformFactor = platformFactors[platform];
    const companyFactor = user?.companyType?.priceRating || 1.0;
    const unitPrice = basePrice * platformFactor * companyFactor;

    let folder;
    try {
      folder = await createFolder(title, "1n3q58YJeS5Qlgf3mWfxqcyABnid4lIdO");
    } catch (error) {
      logger.error(`Error creating folder: ${error.message}`);
      throw new Error(t("ad.folder_creation_failed"));
    }

    const ad = await AdRepository.create({
      userId: userIdFromToken,
      AdType: user.companyType.name,
      unitPrice,
      mediaFolder: folder,
      ...data.body,
      createdAt: new Date(),
      state: "pending",
    });

    logger.info(`Ad created: ${ad._id} by user: ${user.email}`);
    return ad;
  }

  /**
   * Get advertisements for a user
   * @param {Object} data - User data
   * @returns {Promise<Array>} Array of ads
   */
  async getAd(data) {
    const { userIdFromToken, adId } = data;
    if (!userIdFromToken) {
      throw new Error(t("ad.no_user_id"));
    }

    const user = await userRepository.findById(userIdFromToken);
    if (!user) {
      throw new Error(t("ad.user_not_found"));
    }

    const ads = await AdRepository.findByUser(user._id, adId);
    logger.info(`Retrieved ${ads.length} ads for user: ${user.email}`);
    return ads;
  }

  /**
   * Edit an existing advertisement
   * @param {Object} data - Ad edit data
   * @returns {Promise<Object>} Updated ad
   */
  async editAd(data) {
    const { error } = validateEditAd(data.body);
    if (error) throw new Error(t(error.details[0].message));

    const { id, startDate, endDate, pricingModel, type, platform } = data.body;
    const { userIdFromToken } = data;
    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error(t("ad.invalid_dates"));
    }

    if (!userIdFromToken) {
      throw new Error(t("ad.no_user_id"));
    }

    const [user, oldAd] = await Promise.all([
      userRepository.findById(userIdFromToken),
      AdRepository.findById(id),
    ]);

    if (!user || !oldAd) {
      throw new Error(t("ad.not_found"));
    }

    if (oldAd.state !== "pending") {
      throw new Error(t("ad.cannot_edit_published"));
    }

    const basePrice =
      basePrices[pricingModel || oldAd.pricingModel][type || oldAd.type];
    const platformFactor = platformFactors[platform || oldAd.platform];
    const companyFactor = user?.companyType?.priceRating || 1.0;
    const unitPrice = basePrice * platformFactor * companyFactor;

    const updatedAd = await AdRepository.edit(id, {
      unitPrice,
      ...data.body,
      updatedAt: new Date(),
    });

    logger.info(`Ad edited: ${id} by user: ${user.email}`);
    return updatedAd;
  }

  /**
   * Check advertisement value
   * @param {Object} data - Value check data
   * @returns {Promise<Object>} Value estimation
   */
  async valueCheck(data) {
    const { error } = validateValueCheck(data.body);
    if (error) throw new Error(t(error.details[0].message));

    const { pricingModel, type, platform, budget, startDate, endDate } =
      data.body;
    const { userIdFromToken } = data;
    if (!userIdFromToken) {
      throw new Error(t("ad.no_user_id"));
    }

    const user = await userRepository.findById(userIdFromToken);
    if (!user) {
      throw new Error(t("ad.user_not_found"));
    }

    const basePrice = basePrices[pricingModel][type];
    const platformFactor = platformFactors[platform];
    const companyFactor = user?.companyType?.priceRating || 1.0;
    const unitPrice = basePrice * platformFactor * companyFactor;

    let estimatedUnits;
    if (pricingModel === "CPC") {
      estimatedUnits = Math.floor(budget / unitPrice);
    } else {
      estimatedUnits = Math.floor((budget / unitPrice) * 1000);
    }

    const durationDays = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    const dailyBudget = budget / durationDays;

    logger.info(`Value check performed for user: ${user.email}`);
    return {
      estimatedUnits,
      dailyBudget,
    };
  }

  /**
   * Add media to an advertisement
   * @param {Object} data - Media addition data
   * @returns {Promise<Object>} Created media
   */
  async addMedia(data) {
    const { error } = validateAddMedia(data.body);
    if (error) throw new Error(t(error.details[0].message));

    const { adId, mediaType } = data.body;
    const file = data.file;

    const ad = await AdRepository.findById(adId);
    if (!ad) {
      throw new Error(t("ad.not_found"));
    }

    const existingMedia = await AdRepository.findMedia(adId);
    if (existingMedia) {
      throw new Error(t("ad.media_already_exists"));
    }

    if (!ad.mediaFolder) {
      throw new Error(t("ad.no_media_folder"));
    }

    const { platform, type: adType } = ad;

    if (adType === "banner" && mediaType === "video") {
      throw new Error(t("ad.invalid_media_type"));
    }

    if (!file) {
      throw new Error(t("ad.no_media_file"));
    }

    if (mediaType === "image") {
      await validateImage(file, platform, adType);
    }

    let fileId;
    try {
      fileId = await uploadFile(file, ad.mediaFolder, file.originalname);
    } catch (error) {
      logger.error(`Error uploading file: ${error.message}`);
      throw new Error(t("ad.upload_failed"));
    }

    if (!fileId) {
      throw new Error(t("ad.upload_failed"));
    }

    const filePath = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
    const media = await MediaRepository.create({
      adId,
      mediaType,
      url: filePath,
      createdAt: new Date(),
    });

    logger.info(`Media added to ad: ${adId}`);
    return media;
  }

  /**
   * Get media for an advertisement
   * @param {Object} data - Media retrieval data
   * @returns {Promise<Object>} Media data
   */
  async getMedia(data) {
    const { adId } = data;
    const media = await AdRepository.findMedia(adId);
    if (!media) {
      throw new Error(t("ad.no_media_found"));
    }

    logger.info(`Media retrieved for ad: ${adId}`);
    return media;
  }
}

export default new AdvertiserService();
