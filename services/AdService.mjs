import AdRepository from "../repositories/AdRepository.mjs";
import MediaRepository from "../repositories/MediaRepository.mjs";
import userRepository from "../repositories/userRepository.mjs";
import { createFolder } from "../config/createFileForGroup.mjs";
import { uploadFile } from "../config/uploadFiles.mjs";

import { basePrices, platformFactors } from "../utils/price.js";
import {
  validateAddMedia,
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

    if (adData.body.pricingModel === "CPC" && !adData.body.url) {
      throw new Error("يجب تضمين رابط الموقع");
    }

    const basePrice = basePrices[adData.body.pricingModel][adData.body.type];
    const platformFactor = platformFactors[adData.body.platform];
    const companyFactor = user?.companyType?.priceRating || 1.0;

    const unitPrice = basePrice * platformFactor * companyFactor;

    const folder = await createFolder(
      adData.body.title,
      "1n3q58YJeS5Qlgf3mWfxqcyABnid4lIdO"
    );

    return AdRepository.create({
      userId: adData.body.userIdFromToken,
      unitPrice,
      mediaFolder: folder,
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
  async addMedia(adData) {
    const { error } = validateAddMedia(adData.body);
    if (error) throw new Error(error.details[0].message);

    if (!adData?.files[0]) {
      throw new Error("لايوجد ملف صورة او فيديو");
    }
    let adExists = await AdRepository.findById(adData.body.adId);
    if (!adExists) {
      throw new Error("الإعلان المحدد غير موجود");
    }
    if (!adExists.mediaFolder) {
      throw new Error("حدث خطأ");
    }
    let filePath;
    const { id } = await uploadFile(
      adData?.files[0],
      adExists.mediaFolder,
      adData?.files[0].originalname
    );
    if (id) {
      filePath = `https://drive.usercontent.google.com/download?id=${id}&export=download`;
    } else throw new Error("Error");

    return MediaRepository.create({
      adId: adData.body.adId,
      mediaType: adData.body.mediaType,
      mediaURL: filePath,
    });
  }
}
export default new AdService();
