import AnalyticRepository from "../repositories/AnalyticRepository.mjs";
import logger from "../utils/logger.mjs";
import { t } from "i18next";
import Joi from "joi";
import { publisherBudget } from "../utils/price.js";

class AnalyticService {
  /**
   * Validate date range
   * @param {Object} query - Query parameters
   * @returns {Object} Validated start and end dates
   */
  validateDateRange(query) {
    const schema = Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional().min(Joi.ref("startDate")),
      days: Joi.number().integer().min(1).max(90).optional(),
    });

    const { error, value } = schema.validate(query);
    if (error) {
      logger.warn(`Date range validation failed: ${error.message}`);
      throw new Error(t("analytics.invalid_date_range"));
    }

    let endDate = value.endDate ? new Date(value.endDate) : new Date();
    let startDate = value.startDate
      ? new Date(value.startDate)
      : new Date(endDate.getTime() - (value.days || 9) * 24 * 60 * 60 * 1000);

    // Ensure endDate is not in the future
    if (endDate > new Date()) {
      endDate = new Date();
    }

    // Ensure startDate is not too far in the past (e.g., max 90 days)
    const maxDays = 90 * 24 * 60 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() > maxDays) {
      startDate = new Date(endDate.getTime() - maxDays);
    }

    return { startDate, endDate };
  }

  /**
   * Get advertiser analytics
   * @param {Object} data - Analytics data
   * @returns {Promise<Array>} Formatted stats
   */
  async advertiserAnalytics(data) {
    const advertiserId = data.userIdFromToken;
    if (!advertiserId) {
      logger.warn("Missing advertiser ID");
      throw new Error(t("analytics.no_user_id"));
    }

    const { startDate, endDate } = this.validateDateRange(data.query);
    const { stats, budget, totalCost, totalViews, totalClicks } =
      await AnalyticRepository.getAdvertiserStats(
        advertiserId,
        startDate,
        endDate,
        data.adId
      );

    const dateRange = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateRange.push(new Date(d));
    }

    const formattedStats = dateRange.map((date) => {
      const stat = stats.find(
        (s) => s._id === date.toISOString().split("T")[0]
      );
      return {
        date: date.toISOString().split("T")[0],
        views: stat?.totalViews || 0,
        clicks: stat?.totalClicks || 0,
      };
    });

    logger.info(
      `Advertiser analytics retrieved for user: ${advertiserId}${
        data.adId ? `, ad: ${data.adId}` : ""
      }`
    );
    return { formattedStats, budget, totalCost, totalViews, totalClicks };
  }

  /**
   * Get publisher analytics
   * @param {Object} data - Analytics data
   * @returns {Promise<Array>} Formatted stats
   */
  async publisherAnalytics(data) {
    const publisherId = data.userIdFromToken;
    if (!publisherId) {
      logger.warn("Missing publisher ID");
      throw new Error(t("analytics.no_user_id"));
    }

    const { startDate, endDate } = this.validateDateRange(data.query);
    const { stats, budget, totalCost, totalViews, totalClicks } =
      await AnalyticRepository.getPublisherStats(
        publisherId,
        startDate,
        endDate,
        data.adId
      );

    const dateRange = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateRange.push(new Date(d));
    }

    const formattedStats = dateRange.map((date) => {
      const stat = stats.find(
        (s) => s._id === date.toISOString().split("T")[0]
      );
      return {
        date: date.toISOString().split("T")[0],
        views: stat?.totalViews || 0,
        clicks: stat?.totalClicks || 0,
      };
    });

    logger.info(
      `Publisher analytics retrieved for user: ${publisherId}${
        data.adId ? `, ad: ${data.adId}` : ""
      }`
    );
    return {
      formattedStats,
      totalEarnings: publisherBudget(totalCost),
      totalViews,
      totalClicks,
    };
  }

  /**
   * Get admin analytics
   * @param {Object} data - Analytics data
   * @returns {Promise<Array>} Formatted stats
   */
  async adminAnalytics(data) {
    const { startDate, endDate } = this.validateDateRange(data.query);
    const stats = await AnalyticRepository.getAdminStats(startDate, endDate);

    const dateRange = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateRange.push(new Date(d));
    }

    const formattedStats = dateRange.map((date) => {
      const stat = stats.find(
        (s) => s._id === date.toISOString().split("T")[0]
      );
      return {
        date: date.toISOString().split("T")[0],
        views: stat?.totalViews || 0,
        clicks: stat?.totalClicks || 0,
      };
    });

    logger.info(`Admin analytics retrieved`);
    return formattedStats;
  }
}

export default new AnalyticService();
