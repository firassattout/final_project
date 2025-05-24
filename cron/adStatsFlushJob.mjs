import cron from "node-cron";

import redis from "../utils/redisClient.mjs";
import DisplaysRepository from "../repositories/DisplaysRepository.mjs";
import { Ads } from "../models/AdModel.mjs";

cron.schedule("0 * * * *", async () => {
  try {
    const keys = await redis.keys("ad:*:user:*");

    for (const key of keys) {
      const [, adId, , userId] = key.split(":");
      const data = await redis.hgetall(key);

      const views = parseInt(data.views || 0);
      const clicks = parseInt(data.clicks || 0);

      if (views === 0 && clicks === 0) continue;
      const ad = await Ads.findById(adId);
      if (!ad) continue;
      await DisplaysRepository.create({
        adId,
        userId,
        views,
        clicks,
      });

      await redis.del(key);
    }

    console.log("✅ تم تحديث بيانات الإعلانات.");
  } catch (err) {
    console.error("❌ فشل تفريغ بيانات الإعلانات:", err.message);
  }
});
