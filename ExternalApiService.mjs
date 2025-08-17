import axios from "axios";
import logger from "./utils/logger.mjs";
import { t } from "i18next";

async function adMerchant({ merchantMSISDN }) {
  try {
    const response = await axios.post(
      "https://projectone-wqlf.onrender.com/api/merchants/add-merchant",
      {
        balance: "1500",
        hasMerchantWallet: "true",
        merchantMSISDN,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response?.status !== 200) {
      logger.warn(`External API call failed: No code returned`);
      throw new Error(t("external_api.no_code_returned"));
    }

    logger.info(`Successfully retrieved client code from external API`);
    return response.data.message;
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
async function adAppCode({ companyName, programmName, merchantMSISDN }) {
  try {
    const response = await axios.post(
      "https://projectone-wqlf.onrender.com/api/clients/get-code",
      {
        companyName,
        programmName,
        merchantMSISDN,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response?.data?.code) {
      logger.warn(`External API call failed: No code returned`);
      throw new Error(t("external_api.no_code_returned"));
    }

    logger.info(`Successfully retrieved client code from external API`);
    return response.data.code;
  } catch (error) {
    logger.error(`Error in createMerchantApp: ${error.message}`);
    if (error.response) {
      throw new Error(error.response.data);
    } else if (error.request) {
      throw new Error(error.request.data);
    } else {
      throw new Error(error.message);
    }
  }
}
async function getAppCode(merchantMSISDN) {
  try {
    const response = await axios.get(
      "https://projectone-wqlf.onrender.com/api/clients/getCodeByMerchantNumber",
      {
        headers: {
          "Content-Type": "application/json",
          merchantMSISDN,
        },
      }
    );

    if (response?.status !== 200) {
      logger.warn(`External API call failed: No code returned`);
      throw new Error(t("external_api.no_code_returned"));
    }

    logger.info(`Successfully retrieved client code from external API`);
    return response.data;
  } catch (error) {
    logger.error(`Error in createMerchantApp: ${error.message}`);
    if (error.response) {
      throw new Error(error.response.data);
    } else if (error.request) {
      throw new Error(error.request.data);
    } else {
      throw new Error(error.message);
    }
  }
}
async function deleteMerchantApp(appId) {
  try {
    const response = await axios.delete(
      "https://projectone-wqlf.onrender.com/api/clients/deleteCodeById/" +
        appId,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response?.status !== 200) {
      logger.warn(`External API call failed: No code returned`);
      throw new Error(t("external_api.no_code_returned"));
    }

    logger.info(`Successfully retrieved client code from external API`);
    return response.data;
  } catch (error) {
    logger.error(`Error in createMerchantApp: ${error.message}`);
    if (error.response) {
      throw new Error(error.response.data);
    } else if (error.request) {
      throw new Error(error.request.data);
    } else {
      throw new Error(error.message);
    }
  }
}
async function getTransactionByProgram(data) {
  try {
    const response = await axios.get(
      "https://payment-package-4jxy.onrender.com/api/clients/transactionsByProgrammName",
      {
        headers: {
          "Content-Type": "application/json",
          ...data,
        },
      }
    );

    if (!response?.data) {
      logger.warn(`External API call failed: No code returned`);
      throw new Error(t("external_api.no_code_returned"));
    }

    logger.info(`Successfully retrieved client code from external API`);
    return response.data;
  } catch (error) {
    logger.error(`Error in createMerchantApp: ${error.message}`);
    if (error.response) {
      throw new Error(error.response.data);
    } else if (error.request) {
      throw new Error(error.request.data);
    } else {
      throw new Error(error.message);
    }
  }
}
async function getTransaction(data) {
  try {
    const response = await axios.get(
      "https://payment-package-4jxy.onrender.com/api/clients/get-transactions",
      {
        headers: {
          "Content-Type": "application/json",
          ...data,
        },
      }
    );

    if (!response?.data) {
      logger.warn(`External API call failed: No code returned`);
      throw new Error(t("external_api.no_code_returned"));
    }

    logger.info(`Successfully retrieved client code from external API`);
    return response.data;
  } catch (error) {
    logger.error(`Error in createMerchantApp: ${error.message}`);
    return error;
    if (error.response) {
      throw new Error(error.response.data);
    } else if (error.request) {
      throw new Error(error.request.data);
    } else {
      throw new Error(error.message);
    }
  }
}
export default {
  adAppCode,
  adMerchant,
  getAppCode,
  deleteMerchantApp,
  getTransaction,
  getTransactionByProgram,
};
