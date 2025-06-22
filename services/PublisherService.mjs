import axios from "axios";
import AdRepository from "../repositories/AdRepository.mjs";
import { generateEmbedCode } from "../utils/generateEmbedCode.js";
import { validateEmbed } from "../utils/validation.js";
import redis from "../utils/redisClient.mjs";
import { generatePublisherCode } from "../utils/generatePublisherCode.js";
import logger from "../utils/logger.mjs";
import { t } from "i18next";
import { isValidObjectId } from "mongoose";

class PublisherService {
  /**
   * Generate embed code for publisher
   * @param {Object} data - Embed data
   * @returns {Promise<string>} Embed code
   */
  async embed(data) {
    const { error } = validateEmbed(data.body);
    if (error) {
      logger.warn(`Embed validation failed: ${error.details[0].message}`);
      throw new Error(t(error.details[0].message));
    }

    const { type, platform } = data.body;
    const { userIdFromToken } = data;
    if (!isValidObjectId(userIdFromToken)) {
      logger.warn(`Invalid user ID: ${userIdFromToken}`);
      throw new Error(t("publisher.invalid_user_id"));
    }

    const embedCode = generatePublisherCode(userIdFromToken, type, platform);
    logger.info(`Embed code generated for user: ${userIdFromToken}`);
    return embedCode;
  }

  /**
   * Show advertisement
   * @param {Object} data - Ad display data
   * @returns {Promise<string>} Embed code for ad
   */
  async showAd(data) {
    const { userId } = data.params;
    const { type } = data.query;

    if (!isValidObjectId(userId)) {
      logger.warn(`Invalid user ID: ${userId}`);
      throw new Error(t("publisher.invalid_user_id"));
    }

    if (!type) {
      logger.warn("Missing ad type");
      throw new Error(t("publisher.no_ad_type"));
    }

    // Check Redis cache first
    const cacheKey = `ads:active:${type}`;
    let allAds = await redis.get(cacheKey);

    if (!allAds) {
      allAds = await AdRepository.findAllMedia();
      if (!allAds || allAds.length === 0) {
        logger.warn("No ads found");
        throw new Error(t("publisher.no_ads"));
      }
      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(allAds));
    } else {
      allAds = JSON.parse(allAds);
    }

    allAds = allAds.filter(
      (ad) => ad.adId?.state === "active" && ad.adId?.type === type
    );

    if (allAds.length === 0) {
      logger.warn(`No active ads found for type: ${type}`);
      throw new Error(t("publisher.no_active_ads"));
    }

    // Sort by unitPrice (ascending)
    allAds.sort((a, b) => a.adId.unitPrice - b.adId.unitPrice);

    // Random selection
    const randomIndex = Math.floor(Math.random() * allAds.length);
    const selectedAd = allAds[randomIndex];

    let url = selectedAd.url;
    if (selectedAd.mediaType === "image" && url) {
      try {
        const response = await axios.get(url, {
          responseType: "arraybuffer",
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        const mimeType = response.headers["content-type"];
        url = `data:${mimeType};base64,${base64}`;
      } catch (error) {
        logger.error(`Error fetching image: ${error.message}`);
        throw new Error(t("publisher.image_fetch_failed"));
      }
    }

    const embedCode = generateEmbedCode(selectedAd, url, userId, type);
    logger.info(`Ad shown for user: ${userId}, ad: ${selectedAd.adId._id}`);
    return embedCode;
  }

  /**
   * Track advertisement views
   * @param {Object} data - View tracking data
   * @returns {Promise<boolean>} Success status
   */
  async trackViews(data) {
    const { userId, adId } = data;
    if (!isValidObjectId(userId) || !isValidObjectId(adId)) {
      logger.warn(`Invalid IDs - user: ${userId}, ad: ${adId}`);
      throw new Error(t("publisher.invalid_ids"));
    }

    const key = `ad:${adId}:user:${userId}`;
    try {
      await redis.hincrby(key, "views", 1);
      // Set expiration for 30 days
      await redis.expire(key, 30 * 24 * 60 * 60);
      logger.info(`View tracked for ad: ${adId}, user: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error tracking view: ${error.message}`);
      throw new Error(t("publisher.track_view_failed"));
    }
  }

  /**
   * Track advertisement clicks
   * @param {Object} data - Click tracking data
   * @returns {Promise<boolean>} Success status
   */
  async trackClick(data) {
    const { userId, adId } = data;
    if (!isValidObjectId(userId) || !isValidObjectId(adId)) {
      logger.warn(`Invalid IDs - user: ${userId}, ad: ${adId}`);
      throw new Error(t("publisher.invalid_ids"));
    }

    const key = `ad:${adId}:user:${userId}`;
    try {
      await redis.hincrby(key, "clicks", 1);
      // Set expiration for 30 days
      await redis.expire(key, 30 * 24 * 60 * 60);
      logger.info(`Click tracked for ad: ${adId}, user: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error tracking click: ${error.message}`);
      throw new Error(t("publisher.track_click_failed"));
    }
  }
}

export default new PublisherService();
