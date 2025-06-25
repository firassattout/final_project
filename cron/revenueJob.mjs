import cron from "node-cron";
import { AdDisplays } from "../models/AdDisplaysModel.mjs";
import { Ads } from "../models/AdModel.mjs";
import { Earnings } from "../models/EarningsModel.mjs";

cron.schedule("* * * * *", async () => {
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

          cost: { $sum: "$cost" },
        },
      },
    ]);

    const earningsMap = {};

    for (const item of displays) {
      const userId = item._id.userId;
      if (!earningsMap[userId]) earningsMap[userId] = 0;
      earningsMap[userId] += item.cost;
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
  }
});
