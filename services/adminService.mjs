import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";
import {
  validateFirstRegisterUser,
  validateLoginUser,
  validateSecondRegisterUser,
} from "../utils/validation.js";
import { generatePassword } from "../utils/generatePassword.js";
import userRepository from "../repositories/userRepository.mjs";
import logger from "../utils/logger.mjs";
import AdRepository from "../repositories/AdRepository.mjs";
import axios from "axios";
import sharp from "sharp";
import AnalyticService from "./AnalyticService.mjs";

class AdminService {
  /**
   * Deactivate user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deactivation result
   */
  async userDeactivation(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("المستخدم غير موجود");

    let updatedUser;
    if (user.isActive)
      updatedUser = await userRepository.deactivateUser(userId);
    if (!user.isActive) updatedUser = await userRepository.activateUser(userId);

    logger.info(`User deactivated: ${user.email}`);
    return { message: "تم تعديل حالة الحساب الحساب بنجاح", user: updatedUser };
  }

  /**
   * Get users by type or name
   * @param {string} type - User role
   * @param {string} name - User name
   * @returns {Promise<Object>} Users data
   */
  async getUser(type, name) {
    const users = await userRepository.findByType(type, name);
    if (!users.length) throw new Error("لا توجد بيانات للمستخدمين");
    return { users };
  }

  /**
   * Get company types
   * @returns {Promise<Object>} Company types data
   */
  async getCompanyType() {
    const companyTypes = await userRepository.findCompanyType();
    if (!companyTypes.length) throw new Error("لا توجد أنواع شركات متاحة");
    return { companyTypes };
  }

  /**
   * Get advertisements for a user
   * @param {Object} data - User data
   * @returns {Promise<Array>} Array of ads
   */
  async getAd(data) {
    const { userIdFromToken, adId, searchKey, page, limit } = data;
    if (!userIdFromToken) {
      throw new Error(t("ad.no_user_id"));
    }

    const user = await userRepository.findById(userIdFromToken);
    if (!user) {
      throw new Error(t("ad.user_not_found"));
    }

    const ads = await AdRepository.findByAdmin(
      user._id,
      adId,
      searchKey,
      page,
      limit
    );
    if (adId && ads && !ads?.ads.length > 0) {
      const media = await AdRepository.findMedia(adId);
      if (media.url) {
        if (media.mediaType === "image") {
          const response = await axios.get(media.url, {
            responseType: "arraybuffer",
          });
          const resizedBuffer = await sharp(response.data)
            .resize({ width: 1200 })
            .toFormat("jpeg", { quality: 100 })
            .toBuffer();

          const base64 = resizedBuffer.toString("base64");
          ads.photo = `data:image/jpeg;base64,${base64}`;
        } else ads.photo = media.url;
      }
    } else {
      await Promise.all(
        ads.ads.map(async (ad) => {
          const media = await AdRepository.findMedia(ad._id);

          if (media?.url) {
            if (media.mediaType === "image") {
              try {
                const response = await axios.get(media.url, {
                  responseType: "arraybuffer",
                });

                const resizedBuffer = await sharp(response.data)
                  .resize({ width: 300 })
                  .toFormat("jpeg", { quality: 80 })
                  .toBuffer();

                const base64 = resizedBuffer.toString("base64");
                ad.photo = `data:image/jpeg;base64,${base64}`;
              } catch (error) {
                console.error(
                  `Error processing image for ad ${ad._id}:`,
                  error
                );
                ad.photo = media.url;
              }
            } else {
              ad.photo = media.url;
            }
          }
          return ad;
        })
      );
    }

    logger.info(`Retrieved ${ads.length} ads for user: ${user.email}`);
    return ads;
  }

  /**
   * Get user types
   * @returns {Promise<Object>} user types data
   */
  async getOneUser(data) {
    const { userId, adId } = data;
    if (!userId) throw new Error("لا يوجد userId");

    const user = await userRepository.findById(userId);
    if (!user) throw new Error("لا يوجد مستخدم بهذا العنوان");

    if (adId) {
      const ad = await AdRepository.findById(adId);
      if (ad) {
        user.ad = ad;
        const media = await AdRepository.findMedia(adId);
        if (media.mediaType === "image") {
          const response = await axios.get(media.url, {
            responseType: "arraybuffer",
          });
          const resizedBuffer = await sharp(response.data)
            .resize({ width: 1200 })
            .toFormat("jpeg", { quality: 100 })
            .toBuffer();

          const base64 = resizedBuffer.toString("base64");
          user.ad.photo = `data:image/jpeg;base64,${base64}`;
        } else ads.photo = media.url;
      }
    }
    if (user.role === "advertiser") {
      const advertiser = await AnalyticService.advertiserAnalytics(data);
      user.analytic = advertiser;
    }
    if (user.role === "publisher") {
      const publisher = await AnalyticService.publisherAnalytics(data);
      user.analytic = publisher;
    }
    return user;
  }
}

export default new AdminService();
