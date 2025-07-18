import { t } from "i18next";

import userRepository from "../repositories/userRepository.mjs";
import logger from "../utils/logger.mjs";
import ExternalApiService from "../ExternalApiService.mjs";

class MerchantService {
  async createMerchantApp(data) {
    const { companyName, programName } = data.body;
    const { userId } = data;
    const user = await userRepository.findById(userId);

    if (!user || !user?.mobileNumber) {
      logger.warn(
        `User not found or missing mobile number for userId: ${userId}`
      );
      throw new Error(t("merchant_app.merchant_mobileNumber_notFound"));
    }

    try {
      const code = await ExternalApiService.adAppCode({
        companyName,
        programmName: programName,
        merchantMSISDN: user.mobileNumber,
      });

      logger.info(`Merchant application submitted for user: ${userId}`);
      return {
        message: t("merchant_app.success"),
        appId: code,
      };
    } catch (error) {
      logger.error(`Error in createMerchantApp: ${error.message}`);
      throw new Error(t(error.message));
    }
  }
  async getMerchantApp(data) {
    const { userId } = data;
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error(t("merchant_notFound"));
    }

    const apps = await ExternalApiService.getAppCode(user.mobileNumber);
    if (!apps) {
      throw new Error(t("apps_notFound"));
    }
    logger.info(
      `Retrieved ${apps?.length} merchant applications for user: ${userId}`
    );
    return apps;
  }
  async deleteMerchantApp(data) {
    const { appId, userId } = data;

    const apps = await ExternalApiService.deleteMerchantApp(appId);
    if (!apps) {
      throw new Error(t("apps_notFound"));
    }
    logger.info(`deleted ${appId} merchant applications for user: ${userId}`);
    return apps;
  }
}
export default new MerchantService();
