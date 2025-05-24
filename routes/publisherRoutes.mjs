import express from "express";
import PublisherController from "../controllers/PublisherController.mjs";

import { checkUserRole } from "../middleware/checkUserRole.mjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const publisherRoutes = express.Router();

publisherRoutes.post(
  "/embed",
  checkUserRole("publisher"),
  PublisherController.embed
);
publisherRoutes.get("/show-ad/:userId", PublisherController.showAd);
publisherRoutes.post("/track-views", PublisherController.trackViews);
publisherRoutes.post("/track-click", PublisherController.trackClick);

publisherRoutes.get("/stream-video", PublisherController.streamVideo);

publisherRoutes.get(
  "/:sdkType(rewarded-sdk|vue-rewarded-sdk|banner-sdk)",
  (req, res) => {
    const sdkType = req.params.sdkType;
    const filePath = path.join(__dirname, "..", "sdk", `${sdkType}.mjs`);

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res.status(500).send("خطأ في تحميل ملف SDK");
      }

      const finalScript = data.replace(/__URL__/g, process.env.URL);
      res.setHeader("Content-Type", "application/javascript");
      res.send(finalScript);
    });
  }
);
