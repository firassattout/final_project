import AdRepository from "../repositories/AdRepository.mjs";
import userRepository from "../repositories/userRepository.mjs";
import { basePrices, platformFactors } from "../utils/price.js";
import {
  validateCreateAd,
  validateEditAd,
  validatevalueCheck,
} from "../utils/validation.js";

class AdService {
  async createAd(adData) {
    const { error } = validateCreateAd(adData.body);
    if (error) throw new Error(error.details[0].message);

    if (new Date(adData.body.startDate) >= new Date(adData.body.endDate)) {
      throw new Error("Start date must be before end date");
    }

    if (!adData.body.userIdFromToken) {
      throw new Error("لا يوجد معرف للمستخدم");
    }

    let user = await userRepository.findById(adData.body.userIdFromToken);

    if (!user) {
      throw new Error("لا يوجد معرف للمستخدم");
    }

    const basePrice = basePrices[adData.body.pricingModel][adData.body.type];
    const platformFactor = platformFactors[adData.body.platform];
    const companyFactor = user?.companyType?.priceRating || 1.0;

    const unitPrice = basePrice * platformFactor * companyFactor;

    return AdRepository.create({
      userId: adData.body.userIdFromToken,
      unitPrice,
      ...adData.body,
    });
  }
  async getAd(adData) {
    let user = await userRepository.findById(adData.body.userIdFromToken);

    if (!user) {
      throw new Error("لا يوجد معرف للمستخدم");
    }
    let ads = await AdRepository.findByUser(user.id);

    return ads;
  }
  async editAd(adData) {
    const { error } = validateEditAd(adData.body);
    if (error) throw new Error(error.details[0].message);

    if (new Date(adData.body.startDate) >= new Date(adData.body.endDate)) {
      throw new Error("Start date must be before end date");
    }

    if (!adData.body.userIdFromToken) {
      throw new Error("لا يوجد معرف للمستخدم");
    }

    let user = await userRepository.findById(adData.body.userIdFromToken);

    if (!user) {
      throw new Error("لا يوجد معرف للمستخدم");
    }
    let oldAd = await AdRepository.findById(adData.body.id);

    if (!user || !oldAd) {
      throw new Error("لا يوجد معرف للمستخدم");
    }
    if (oldAd.state !== "pending") {
      throw new Error("لا يمكن تعديل الاعلان بعد نشره");
    }

    const basePrice =
      basePrices[adData.body.pricingModel || oldAd.pricingModel][
        adData.body.type || oldAd.type
      ];
    const platformFactor =
      platformFactors[adData.body.platform || oldAd.platform];
    const companyFactor = user?.companyType?.priceRating || 1.0;

    const unitPrice = basePrice * platformFactor * companyFactor;

    return AdRepository.edit(adData.body.id, {
      unitPrice,
      ...adData.body,
    });
  }
  async valueCheck(adData) {
    const { error } = validatevalueCheck(adData.body);
    if (error) throw new Error(error.details[0].message);

    if (!adData.body.userIdFromToken) {
      throw new Error("لا يوجد معرف للمستخدم");
    }

    let user = await userRepository.findById(adData.body.userIdFromToken);

    if (!user) {
      throw new Error("لا يوجد معرف للمستخدم");
    }

    const basePrice = basePrices[adData.body.pricingModel][adData.body.type];
    const platformFactor = platformFactors[adData.body.platform];
    const companyFactor = user?.companyType?.priceRating || 1.0;

    const unitPrice = basePrice * platformFactor * companyFactor;
    let estimatedUnits;
    if (adData.body.pricingModel === "CPC") {
      estimatedUnits = Math.floor(adData.body.budget / unitPrice);
    } else {
      estimatedUnits = Math.floor((adData.body.budget / unitPrice) * 1000);
    }

    const durationDays = Math.ceil(
      (new Date(adData.body.endDate) - new Date(adData.body.startDate)) /
        (1000 * 60 * 60 * 24)
    );
    const dailyBudget = adData.body.budget / durationDays;
    return {
      estimatedUnits,
      dailyBudget,
    };
  }
}
export default new AdService();
