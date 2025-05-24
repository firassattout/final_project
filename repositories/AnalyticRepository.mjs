import { AdDisplays } from "../models/AdDisplaysModel.mjs";

import mongoose from "mongoose";

class AnalyticRepository {
  async getAdvertiserStats(advertiserId, startDate, endDate) {
    return await AdDisplays.aggregate([
      {
        $lookup: {
          from: "ads",
          localField: "adId",
          foreignField: "_id",
          as: "ad",
        },
      },

      {
        $unwind: "$ad",
      },

      {
        $match: {
          "ad.userId": new mongoose.Types.ObjectId(advertiserId),
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalViews: { $sum: "$views" },
          totalClicks: { $sum: "$clicks" },
        },
      },

      {
        $sort: { _id: -1 },
      },
    ]);
  }

  async getPublisherStats(publisherId, startDate, endDate) {
    return await AdDisplays.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(publisherId),
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalViews: { $sum: "$views" },
          totalClicks: { $sum: "$clicks" },
        },
      },

      {
        $sort: { _id: -1 },
      },
    ]);
  }
  async getAdminStats(startDate, endDate) {
    return await AdDisplays.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalViews: { $sum: "$views" },
          totalClicks: { $sum: "$clicks" },
        },
      },

      {
        $sort: { _id: -1 },
      },
    ]);
  }
}

export default new AnalyticRepository();
