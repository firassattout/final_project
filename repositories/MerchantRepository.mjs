import mongoose from "mongoose";
import { merchantApp } from "../models/MerchantApp.mjs";

import logger from "../utils/logger.mjs";
import { t } from "i18next";

async function create({ userId, companyName, programName, code }) {
  try {
    const app = await merchantApp.create({
      userId,
      companyName,
      programName,
      code,
    });
    logger.info(`Merchant application created for user: ${userId}`);
    return app;
  } catch (error) {
    logger.error(`Error creating merchant application: ${error.message}`);
    throw new Error(t("merchant_app.create_failed"));
  }
}
/**
 * Find all merchant applications for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of merchant application documents
 * @throws {Error} If query fails
 */
async function findByUserId(userId) {
  try {
    const apps = await merchantApp.find({ userId }).select("-__v").lean();
    logger.info(
      `Retrieved ${apps.length} merchant applications for user: ${userId}`
    );
    return apps;
  } catch (error) {
    logger.error(`Error finding merchant applications: ${error.message}`);
    throw new Error(t("merchant_app.find_failed"));
  }
}
export default { create, findByUserId };
