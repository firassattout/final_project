import axios from "axios";
import AdRepository from "../repositories/AdRepository.mjs";
import { generateEmbedCode } from "../utils/generateEmbedCode.js";
import { validateEmbed } from "../utils/validation.js";
import redis from "../utils/redisClient.mjs";
import { generatePublisherCode } from "../utils/generatePublisherCode.js";
import logger from "../utils/logger.mjs";
import { t } from "i18next";
import mongoose, { isValidObjectId } from "mongoose";
import ReportRepository from "../repositories/ReportRepository.mjs";
import zlib from "zlib";
import { Earnings } from "../models/EarningsModel.mjs";
import ExternalApiService from "../ExternalApiService.mjs";
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

    const { type, platform, selectedType } = data.body;
    const { userIdFromToken } = data;
    if (!isValidObjectId(userIdFromToken)) {
      logger.warn(`Invalid user ID: ${userIdFromToken}`);
      throw new Error(t("publisher.invalid_user_id"));
    }

    const embedData = {
      userId: userIdFromToken,
      type,
      platform,
      selectedType,
    };

    const jsonData = JSON.stringify(embedData);
    const compressedData = zlib.deflateSync(jsonData).toString("base64");
    const embedCode = generatePublisherCode(
      type,
      platform,
      encodeURIComponent(compressedData)
    );
    logger.info(`Embed code generated for user: ${userIdFromToken}`);
    return embedCode;
  }

  /**
   * Show advertisement
   * @param {Object} data - Ad display data
   * @returns {Promise<string>} Embed code for ad
   */
  async showAd(data) {
    const compressedData = data?.query?.compressedData;
    const decompressedData = zlib
      .inflateSync(Buffer.from(compressedData, "base64"))
      .toString();

    const originalData = JSON.parse(decodeURIComponent(decompressedData));
    const userId = originalData.userId;
    const selectedType = originalData.selectedType;
    const type = originalData.type;
    const position = data?.query?.position || "top";

    let ad = await AdRepository.findRandomAdMedia(type, selectedType);
    if (!ad || !ad.url) {
      return false;
    }
    if (!type) {
      throw new Error("نوع الإعلان غير موجود");
    }

    let url;
    if (ad?.mediaType === "image") {
      if (ad.url) {
        const response = await axios.get(ad.url, {
          responseType: "arraybuffer",
        });
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        const mimeType = response.headers["content-type"];
        url = `data:${mimeType};base64,${base64}`;
      }
    }

    const embedCode = generateEmbedCode(
      ad,
      url,
      userId,
      type,
      data.nonce,
      position
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

  /**
   * Report advertisement
   * @param {Object} data - Report data
   * @returns {Promise<Object>} Report confirmation
   */
  async reportAd(data) {
    const { adId, userId, message, reportedAt } = data.body;

    // التحقق من وجود الإعلان
    const ad = await AdRepository.findById(adId);
    if (!ad) {
      logger.warn(`Ad not found: ${adId}`);
      throw new Error(t("report.ad_not_found"));
    }

    // إنشاء الإبلاغ
    const report = await ReportRepository.create({
      adId,
      userId,
      message,
      reportedAt: new Date(reportedAt),
    });

    logger.info(`Report submitted for ad: ${adId} by user: ${userId}`);
    return {
      message: t("report.success"),
      reportId: report._id,
    };
  }
  /**
   * Get all earnings for publisher with pagination
   * @param {Object} data - Request data
   * @returns {Promise<Object>} Earnings with pagination
   */
  async getEarnings(data) {
    const { userId, page = 1, limit = 10 } = data;

    if (!Number.isInteger(page) || page < 1) {
      logger.warn(`Invalid page number: ${page}`);
      throw new Error(t("earnings.invalid_page"));
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      logger.warn(`Invalid limit: ${limit}`);
      throw new Error(t("earnings.invalid_limit"));
    }
    const skip = (page - 1) * limit;

    const matchStage = { userId: new mongoose.Types.ObjectId(userId) };

    const [results, countResult] = await Promise.all([
      Earnings.aggregate([
        { $match: matchStage },
        { $sort: { date: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $skip: skip },
        { $limit: limit },

        {
          $project: {
            user: 0,
            __v: 0,
          },
        },
      ]),
      Earnings.aggregate([
        { $match: matchStage },
        {
          $count: "total",
        },
      ]),
    ]);

    const totalItems = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      earnings: results,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  /**
   * Get total earnings and withdrawable earnings
   * @param {Object} data - Request data
   * @returns {Promise<Object>} Earnings summary
   */
  async getTotalEarnings(data) {
    const { userId } = data;
    const withdrawalPeriod = 14 * 24 * 60 * 60 * 1000;
    const withdrawalDate = new Date(Date.now() - withdrawalPeriod);

    const totalEarnings = await Earnings.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$earnings" } } },
    ]);

    const withdrawableEarnings = await Earnings.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $lte: withdrawalDate },
          isPaid: false,
        },
      },
      { $group: { _id: null, total: { $sum: "$earnings" } } },
    ]);

    return {
      totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
      withdrawableEarnings:
        withdrawableEarnings.length > 0 ? withdrawableEarnings[0].total : 0,
    };
  }
  /**
   * Request withdrawal of earnings
   * @param {Object} data - Request data containing userId, amount, and paymentLink
   * @returns {Promise<Object>} Withdrawal confirmation
   */
  async requestWithdrawal(data) {
    const { userId, paymentLink } = data;

    if (!userId || !paymentLink) {
      logger.warn("Missing required fields for withdrawal");
      throw new Error(t("withdrawal.missing_fields"));
    }

    const withdrawalPeriod = 14 * 24 * 60 * 60 * 1000;
    const withdrawalDate = new Date(Date.now() - withdrawalPeriod);

    const withdrawableEarnings = await Earnings.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $lte: withdrawalDate },
          isPaid: false,
        },
      },
      { $group: { _id: null, total: { $sum: "$earnings" } } },
    ]);

    const availableAmount =
      withdrawableEarnings.length > 0 ? withdrawableEarnings[0].total : 0;

    let response;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // تحديث الأرباح إلى حالة "مسحوب"
        const updateResult = await Earnings.updateMany(
          {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $lte: withdrawalDate },
            isPaid: false,
          },
          {
            $set: {
              isPaid: true,
              paymentDate: new Date(),
            },
          },
          { session }
        );

        if (updateResult.modifiedCount === 0) {
          logger.warn(`No withdrawable earnings found for user: ${userId}`);
          throw new Error(t("withdrawal.no_earnings"));
        }

        response = await ExternalApiService.getBalance(
          paymentLink,
          availableAmount
        );

        logger.info(
          `Withdrawal of ${availableAmount} requested for user: ${userId} via ${paymentLink}`
        );
      });

      return {
        message: t("withdrawal.success"),
        availableAmount,
        response,
        paymentLink,
      };
    } catch (error) {
      logger.error(`Withdrawal error for user ${userId}: ${error.message}`);
      throw new Error(t(error.message));
    } finally {
      session.endSession();
    }
  }
}

export default new PublisherService();
