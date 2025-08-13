import mongoose from "mongoose";

import logger from "../utils/logger.mjs";
import { t } from "i18next";

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
export default { findByUserId };
