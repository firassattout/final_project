import express from "express";
import PublisherController from "../controllers/PublisherController.mjs";

import { checkUserRole } from "../middleware/checkUserRole.mjs";
import axios from "axios";

export const publisherRoutes = express.Router();

publisherRoutes.post(
  "/embed",
  checkUserRole("publisher"),
  PublisherController.embed
);
publisherRoutes.get("/show-ad/:userId", PublisherController.showAd);
publisherRoutes.post(
  "/rewarded-complete",
  PublisherController.rewardedComplete
);
publisherRoutes.post("/track-click", PublisherController.trackClick);

publisherRoutes.get("/stream-video", async (req, res) => {
  const { url } = req.query; // مثال: ?url=https://drive.google...

  if (!url) return res.status(400).send("URL is required");

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        // أحيانًا تحتاج تعديل هذه الهيدر حسب المصدر (مثلاً Google Drive)
        // "User-Agent": "Mozilla/5.0",
      },
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Content-Disposition", "inline");

    // بث البيانات مباشرة للمستخدم
    response.data.pipe(res);
  } catch (err) {
    console.error("Streaming error:", err.message);
    res.status(500).send("Failed to stream video");
  }
});
