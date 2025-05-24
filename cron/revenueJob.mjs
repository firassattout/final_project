import cron from "node-cron";
import { AdDisplays } from "../models/AdDisplaysModel.mjs";
import { Ads } from "../models/AdModel.mjs";
import { Earnings } from "../models/EarningsModel.mjs";

cron.schedule("0 * * * *", async () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const lastEarning = await Earnings.findOne().sort({ date: -1 });
  let startDate = lastEarning
    ? new Date(lastEarning.date.getTime() + 86400000)
    : new Date(today.getTime() - 2 * 86400000);

  while (startDate <= today) {
    const endDate = new Date(startDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const displays = await AdDisplays.aggregate([
      {
        $match: {
          updatedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { userId: "$userId", adId: "$adId" },
          views: { $sum: "$views" },
          clicks: { $sum: "$clicks" },
        },
      },
    ]);

    const earningsMap = {};

    for (const item of displays) {
      const ad = await Ads.findById(item._id.adId);
      if (!ad) continue;

      let earnings = 0;
      if (ad.pricingModel === "CPC") {
        earnings = item.clicks * Number(ad.unitPrice);
      } else if (ad.pricingModel === "CPM") {
        earnings = (item.views / 1000) * Number(ad.unitPrice);
      }

      const userId = item._id.userId;
      if (!earningsMap[userId]) earningsMap[userId] = 0;
      earningsMap[userId] += earnings;
    }

    for (const userId in earningsMap) {
      const exists = await Earnings.findOne({ userId, date: startDate });
      if (!exists) {
        await Earnings.create({
          userId,
          date: startDate,
          earnings: earningsMap[userId],
        });
      }
    }

    console.log(
      `✅ تم حساب أرباح يوم ${startDate.toISOString().split("T")[0]}`
    );
    startDate = new Date(startDate.getTime() + 86400000);

    const previousEarnings = await Earnings.aggregate([
      { $match: { userId: item._id.userId } },
      { $group: { _id: null, total: { $sum: "$earnings" } } },
    ]);
    const totalEarnings = previousEarnings[0]?.total || 0;
    const adBudget = Number(ad.budget);

    if (totalEarnings >= adBudget && ad.state !== "ended") {
      ad.state = "ended";
      await ad.save();
      console.log(`🛑 تم إيقاف الإعلان ${ad._id} لتجاوز الميزانية`);
    }
  }
});
