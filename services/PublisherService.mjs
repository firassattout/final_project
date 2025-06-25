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
    let allAds = await AdRepository.findAllMedia();
    if (!allAds) {
      throw new Error("الإعلان غير موجود");
    }
    const type = data?.query?.type;
    if (!type) {
      throw new Error("نوع الإعلان غير موجود");
    }

    allAds = allAds.filter(
      (ad) => ad.adId.state === "active" && ad.adId.type === type
    );
    allAds = allAds.sort((a, b) => a.adId.unitPrice - b.adId.unitPrice);

    if (allAds.length === 0) {
      throw new Error("  غير موجود");
    }

    let rand = Math.random();
    rand = Math.floor(Math.random() * allAds.length);

    let url;
    if (allAds.at(rand)?.mediaType === "image") {
      if (allAds.at(rand).url) {
        const response = await axios.get(allAds.at(rand).url, {
          responseType: "arraybuffer",
        });
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        const mimeType = response.headers["content-type"];
        url = `data:${mimeType};base64,${base64}`;
      }
    }

    const embedCode = generateEmbedCode(
      allAds.at(rand),
      url,
      data.params?.userId,
      type,
      data.nonce
    );
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
