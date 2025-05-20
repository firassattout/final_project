import PublisherFacade from "../facade/PublisherFacade.mjs";
import asyncHandler from "express-async-handler";
import { getErrorHtml } from "../utils/getErrorHtml.js";

class PublisherController {
  embed = asyncHandler(async (req, res) => {
    const result = await PublisherFacade.embed(req);
    res.send(result);
  });
  rewardedComplete = asyncHandler(async (req, res) => {
    const result = await PublisherFacade.rewardedComplete(req);
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
}

export default new PublisherController();
