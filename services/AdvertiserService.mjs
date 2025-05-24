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

import { validateImage } from "../utils/photoSize.mjs";

class AdvertiserService {
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
      AdType: user.companyType.name,
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

    let adExists = await AdRepository.findById(adData.body.adId);
    if (!adExists) {
      throw new Error("الإعلان المحدد غير موجود");
    }

    let mediaExists = await AdRepository.findMedia(adData.body.adId);
    if (mediaExists) {
      throw new Error("تم اضافة الملفات");
    }

    if (!adExists.mediaFolder) {
      throw new Error("لايوجد مجلد للاعلان");
    }

    const { platform, type: adType } = adExists;
    const files = adData.files || [];

    if (adType && adType === "banner" && adData.body.mediaType === "video") {
      throw new Error("لا تستطيع رفع فيديو في حالة البانير");
    }

    if (!files[0]) {
      throw new Error("لايوجد ملف صورة أو فيديو");
    }

    if (adData.body.mediaType === "image")
      await validateImage(files[0], platform, adType);

    const { id } = await uploadFile(
      files[0],
      adExists.mediaFolder,
      files[0].originalname
    );
    if (!id) throw new Error("فشل رفع الملف");

    const filePath = `https://drive.usercontent.google.com/download?id=${id}&export=download`;
    return MediaRepository.create({
      adId: adData.body.adId,
      mediaType: adData.body.mediaType,
      url: filePath,
    });
  }
  async getMedia(adData) {
    let media = await AdRepository.findMedia(adData.params.adId);
    if (!media) {
      throw new Error("لا يوجد ملفات ");
    }

    return media;
  }
}
export default new AdvertiserService();
