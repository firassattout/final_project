import { AdDisplays } from "../models/AdDisplaysModel.mjs";
import mongoose from "mongoose";
import logger from "../utils/logger.mjs";
import { t } from "i18next";
import redis from "../utils/redisClient.mjs";
import AdRepository from "./AdRepository.mjs";

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

    try {
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
      const matchStage2 = {};
      if (adId) {
        matchStage.adId = new mongoose.Types.ObjectId(adId);
      }

      const [result] = await AdDisplays.aggregate([
        { $match: matchStage2 },
        {
          $group: {
            _id: null,
            totalCost: { $sum: "$cost" },
            totalViews: { $sum: "$views" },
            totalClicks: { $sum: "$clicks" },
          },
        },
      ]);

      const totalCost = result?.totalCost || 0;
      const totalViews = result?.totalViews || 0;
      const totalClicks = result?.totalClicks || 0;

      let budget = 0;
      if (adId) {
        const ad = await AdRepository.findById(adId);
        budget = ad.budget;
      } else {
        const ads = await AdRepository.findByUser(advertiserId);
        budget = ads.reduce((sum, ad) => sum + parseFloat(ad.budget), 0);
      }
      return { stats, budget, totalCost, totalViews, totalClicks };
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

    try {
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
    try {
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

      logger.info(`Admin stats retrieved`);
      return stats;
    } catch (error) {
      logger.error(`Error getting admin stats: ${error.message}`);
      throw new Error(t("analytics.stats_failed"));
    }
  }
}

export default new AnalyticRepository();
