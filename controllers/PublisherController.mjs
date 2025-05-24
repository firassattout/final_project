import PublisherFacade from "../facade/PublisherFacade.mjs";
import asyncHandler from "express-async-handler";
import { getErrorHtml } from "../utils/getErrorHtml.js";
import axios from "axios";
class PublisherController {
  embed = asyncHandler(async (req, res) => {
    const result = await PublisherFacade.embed(req);
    res.send(result);
  });
  trackViews = asyncHandler(async (req, res) => {
    const result = await PublisherFacade.trackViews(req);
    res.send(result);
  });
  trackClick = asyncHandler(async (req, res) => {
    const result = await PublisherFacade.trackClick(req);
    res.send(result);
  });
  showAd = async (req, res) => {
    try {
      const result = await PublisherFacade.showAd(req);

      if (!result) {
        return res
          .status(404)
          .setHeader(
            "Content-Security-Policy",
            "script-src 'self' 'nonce-my-nonce-123'; object-src 'none';"
          )
          .send(getErrorHtml("الإعلان غير متوفر"));
      }

      res
        .status(200)
        .setHeader(
          "Content-Security-Policy",
          "script-src 'self' 'nonce-my-nonce-123'; object-src 'none';"
        )
        .send(result);
    } catch (e) {
      console.error("Error showing ad:", e);

      res
        .status(500)
        .setHeader(
          "Content-Security-Policy",
          "script-src 'self' 'nonce-my-nonce-123'; object-src 'none';"
        )
        .send(getErrorHtml("حدث خطأ في تحميل الإعلان"));
    }
  };
  streamVideo = asyncHandler(async (req, res) => {
    const { url } = req.query;

    if (!url) return res.status(400).send("URL is required");

    try {
      const response = await axios.get(url, {
        responseType: "stream",
      });

      res.setHeader("Content-Type", response.headers["content-type"]);
      res.setHeader("Content-Disposition", "inline");

      response.data.pipe(res);
    } catch (err) {
      console.error("Streaming error:", err.message);
      res.status(500).send("Failed to stream video");
    }
  });
}

export default new PublisherController();
