import axios from "axios";
import AdRepository from "../repositories/AdRepository.mjs";
import { generateEmbedCode } from "../utils/generateEmbedCode.js";
import { generateIframeEmbedCode } from "../utils/generateIframeEmbedCode.js";
import { AD_VALIDATIONS } from "../utils/photoSize.mjs";
import DisplaysRepository from "../repositories/DisplaysRepository.mjs";

class PublisherService {
  async embed(data) {
    if (!data.body.adId) {
      throw new Error("الإعلان غير موجود");
    }
    let ad = await AdRepository.findById(data.body.adId);
    if (!ad) {
      throw new Error("الإعلان غير موجود");
    }
    const { platform, type: adType } = ad;
    const width =
      data.body?.width || AD_VALIDATIONS[adType][platform].width.max;
    const height =
      data.body?.height || AD_VALIDATIONS[adType][platform].height.max;

    if (!platform || !adType) {
      throw new Error("حدث خطأ ما");
    }

    const embedCode = generateIframeEmbedCode(
      data.body.userIdFromToken,
      width,
      height,
      adType
    );
    return embedCode;
  }

  async showAd(data) {
    let allAds = await AdRepository.findAllMedia();
    if (!allAds) {
      throw new Error("الإعلان غير موجود");
    }

    allAds = allAds.filter((ad) => ad.adId.state === "active");
    allAds = allAds.sort((a, b) => a.adId.unitPrice - b.adId.unitPrice);

    let rand = Math.random();
    rand = Math.floor(Math.random() * allAds.length);

    let url;
    if (allAds.at(rand)?.mediaType === "image") {
      if (allAds.at(rand).url) {
        const response = await axios.get(allAds.at(rand).url, {
          responseType: "arraybuffer",
        });
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        const mimeType = response.headers["content-type"];
        url = `data:${mimeType};base64,${base64}`;
      }
    }
    const embedCode = generateEmbedCode(
      allAds.at(rand),
      url,
      data.params?.userId
    );
    return embedCode;
  }
  async rewardedComplete(data) {
    if (!data.body.userId || !data.body.adId) {
      throw new Error("الإعلان غير موجود");
    }
    let ad = await DisplaysRepository.findOne({
      userId: data.body.userId,
      adId: data.body.adId,
    });
    if (!ad) {
      DisplaysRepository.create({
        userId: data.body.userId,
        adId: data.body.adId,
        views: 1,
        clicks: 0,
      });
    } else {
      DisplaysRepository.inc(ad.id, { views: 1 });
    }
  }

  async trackClick(data) {
    if (!data.body.userId || !data.body.adId) {
      throw new Error("الإعلان غير موجود");
    }
    let ad = await DisplaysRepository.findOne({
      userId: data.body.userId,
      adId: data.body.adId,
    });
    if (!ad) {
      DisplaysRepository.create({
        userId: data.body.userId,
        adId: data.body.adId,
        views: 0,
        clicks: 1,
      });
    } else {
      DisplaysRepository.inc(ad.id, { clicks: 1 });
    }
  }
}
export default new PublisherService();
