import { AdDisplays } from "../models/AdDisplaysModel.mjs";
import mongoose from "mongoose";
import logger from "../utils/logger.mjs";
import { t } from "i18next";
import redis from "../utils/redisClient.mjs";

class AnalyticRepository {
  /**
   * Get advertiser statistics
   * @param {string} advertiserId - Advertiser ID
   * @param {Date} startDate - Start date for stats
   * @param {Date} endDate - End date for stats
   * @param {string} [adId] - Optional advertisement ID
   * @returns {Promise<Array>} Aggregated stats
   */
  async getAdvertiserStats(advertiserId, startDate, endDate, adId) {
    if (!mongoose.Types.ObjectId.isValid(advertiserId)) {
      logger.warn(`Invalid advertiser ID: ${advertiserId}`);
      throw new Error(t("analytics.invalid_id"));
    }
    if (adId && !mongoose.Types.ObjectId.isValid(adId)) {
      logger.warn(`Invalid ad ID: ${adId}`);
      throw new Error(t("analytics.invalid_ad_id"));
    }

    const cacheKey = `stats:advertiser:${advertiserId}:${startDate.toISOString()}:${endDate.toISOString()}${
      adId ? `:${adId}` : ""
    }`;
    try {
      // Check Redis cache
      const cachedStats = await redis.get(cacheKey);
      if (cachedStats) {
        logger.info(
          `Cache hit for advertiser stats: ${advertiserId}${
            adId ? `, ad: ${adId}` : ""
          }`
        );
        return JSON.parse(cachedStats);
      }

      const matchStage = {
        "ad.userId": new mongoose.Types.ObjectId(advertiserId),
        createdAt: { $gte: startDate, $lte: endDate },
      };
      if (adId) {
        matchStage["ad._id"] = new mongoose.Types.ObjectId(adId);
      }

      const stats = await AdDisplays.aggregate([
        {
          $lookup: {
            from: "ads",
            localField: "adId",
            foreignField: "_id",
            as: "ad",
          },
        },
        { $unwind: "$ad" },
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalViews: { $sum: "$views" },
            totalClicks: { $sum: "$clicks" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(stats));
      logger.info(
        `Advertiser stats retrieved: ${advertiserId}${
          adId ? `, ad: ${adId}` : ""
        }`
      );
      return stats;
    } catch (error) {
      logger.error(`Error getting advertiser stats: ${error.message}`);
      throw new Error(t("analytics.stats_failed"));
    }
  }

  /**
   * Get publisher statistics
   * @param {string} publisherId - Publisher ID
   * @param {Date} startDate - Start date for stats
   * @param {Date} endDate - End date for stats
   * @param {string} [adId] - Optional advertisement ID
   * @returns {Promise<Array>} Aggregated stats
   */
  async getPublisherStats(publisherId, startDate, endDate, adId) {
    if (!mongoose.Types.ObjectId.isValid(publisherId)) {
      logger.warn(`Invalid publisher ID: ${publisherId}`);
      throw new Error(t("analytics.invalid_id"));
    }
    if (adId && !mongoose.Types.ObjectId.isValid(adId)) {
      logger.warn(`Invalid ad ID: ${adId}`);
      throw new Error(t("analytics.invalid_ad_id"));
    }

    const cacheKey = `stats:publisher:${publisherId}:${startDate.toISOString()}:${endDate.toISOString()}${
      adId ? `:${adId}` : ""
    }`;
    try {
      // Check Redis cache
      const cachedStats = await redis.get(cacheKey);
      if (cachedStats) {
        logger.info(
          `Cache hit for publisher stats: ${publisherId}${
            adId ? `, ad: ${adId}` : ""
          }`
        );
        return JSON.parse(cachedStats);
      }

      const matchStage = {
        userId: new mongoose.Types.ObjectId(publisherId),
        createdAt: { $gte: startDate, $lte: endDate },
      };
      if (adId) {
        matchStage.adId = new mongoose.Types.ObjectId(adId);
      }

      const stats = await AdDisplays.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalViews: { $sum: "$views" },
            totalClicks: { $sum: "$clicks" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(stats));
      logger.info(
        `Publisher stats retrieved: ${publisherId}${
          adId ? `, ad: ${adId}` : ""
        }`
      );
      return stats;
    } catch (error) {
      logger.error(`Error getting publisher stats: ${error.message}`);
      throw new Error(t("analytics.stats_failed"));
    }
  }

  /**
   * Get admin statistics
   * @param {Date} startDate - Start date for stats
   * @param {Date} endDate - End date for stats
   * @returns {Promise<Array>} Aggregated stats
   */
  async getAdminStats(startDate, endDate) {
    const cacheKey = `stats:admin:${startDate.toISOString()}:${endDate.toISOString()}`;
    try {
      // Check Redis cache
      const cachedStats = await redis.get(cacheKey);
      if (cachedStats) {
        logger.info(`Cache hit for admin stats`);
        return JSON.parse(cachedStats);
      }

      const stats = await AdDisplays.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalViews: { $sum: "$views" },
            totalClicks: { $sum: "$clicks" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(stats));
      logger.info(`Admin stats retrieved`);
      return stats;
    } catch (error) {
      logger.error(`Error getting admin stats: ${error.message}`);
      throw new Error(t("analytics.stats_failed"));
    }
  }
}

export default new AnalyticRepository();
