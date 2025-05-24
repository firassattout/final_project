import axios from "axios";
import AdRepository from "../repositories/AdRepository.mjs";
import { generateEmbedCode } from "../utils/generateEmbedCode.js";
import { validateEmbed } from "../utils/validation.js";
import redis from "../utils/redisClient.mjs";
import { generatePublisherCode } from "../utils/generatePublisherCode.js";

class PublisherService {
  async embed(data) {
    const { error } = validateEmbed(data.body);
    if (error) throw new Error(error.details[0].message);
    const embedCode = generatePublisherCode(
      data.body.userIdFromToken,
      data.body.type,
      data.body.platform
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

  async trackViews(data) {
    if (!data.body.userId || !data.body.adId) {
      throw new Error("الإعلان غير موجود");
    }
    const key = `ad:${data.body.adId}:user:${data.body.userId}`;
    await redis.hincrby(key, "views", 1);
    return true;
  }

  async trackClick(data) {
    if (!data.body.userId || !data.body.adId) {
      throw new Error("الإعلان غير موجود");
    }
    const key = `ad:${data.body.adId}:user:${data.body.userId}`;
    await redis.hincrby(key, "clicks", 1);
    return true;
  }
}
export default new PublisherService();
