import { t } from "i18next";
import MerchantRepository from "../repositories/MerchantRepository.mjs";

import userRepository from "../repositories/userRepository.mjs";
import logger from "../utils/logger.mjs";
import axios from "axios";

class MerchantService {
  async createMerchantApp(data) {
    const { companyName, programName } = data.body;
    const { userId } = data;
    const user = await userRepository.findById(userId);

    if (!user || !user?.mobileNumber) {
      throw new Error(t("merchant_mobileNumber_notFound"));
    }

    try {
      const response = await axios.post(
        "https://projectone-wqlf.onrender.com/api/clients/get-code",
        {
          companyName: companyName,
          programmName: programName,
          merchantMSISDN: user.mobileNumber,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response?.data.code) {
        logger.warn(`External API call failed with status:`);
        throw new Error(t(response.message));
      }
      const app = await MerchantRepository.create({
        userId,
        companyName,
        programName,
        code: response?.data.code,
      });

      logger.info(`Merchant application submitted for user: ${userId}`);
      return {
        message: t("merchant_app.success"),
        appId: app._id,
      };
    } catch (error) {
      logger.error(`Error in createMerchantApp: ${error.message}`);
      if (error.response) {
        throw new Error(error.response.data.message);
      } else if (error.request) {
        throw new Error(error.request.data.message);
      } else {
        throw new Error(error.message);
      }
    }
  }
  async getMerchantApp(data) {
    const { userId } = data;
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error(t("merchant_notFound"));
    }

    const apps = await MerchantRepository.findByUserId(userId);
    logger.info(
      `Retrieved ${apps.length} merchant applications for user: ${userId}`
    );
    return apps;
  }
}
export default new MerchantService();
