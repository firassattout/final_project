import asyncHandler from "express-async-handler";
import PublisherFacade from "../facade/PublisherFacade.mjs";
import logger from "../utils/logger.mjs";
import { getErrorHtml } from "../utils/getErrorHtml.js";
import axios from "axios";
import { generateNonce } from "../utils/securityUtils.mjs";

class PublisherController {
  /**
   * Generate embed code
   */
  embed = asyncHandler(async (req, res) => {
    const result = await PublisherFacade.embed({
      body: req.body,
      userIdFromToken: req.user?.id,
    });
    res.status(200).send(result);
  });

  /**
   * Track advertisement views
   */
  trackViews = asyncHandler(async (req, res) => {
    const result = await PublisherFacade.trackViews(req.body);
    res.status(200).json(result);
  });

  /**
   * Track advertisement clicks
   */
  trackClick = asyncHandler(async (req, res) => {
    const result = await PublisherFacade.trackClick(req.body);
    res.status(200).json(result);
  });

  /**
   * Show advertisement
   */
  showAd = asyncHandler(async (req, res) => {
    const nonce = generateNonce();
    try {
      const result = await PublisherFacade.showAd({
        params: req.params,
        query: req.query,
        nonce,
      });

      res
        .status(200)
        .setHeader(
          "Content-Security-Policy",
          `script-src 'self' 'nonce-${nonce}'; object-src 'none'; img-src 'self' data:; frame-ancestors *`
        )
        .setHeader("X-Content-Type-Options", "nosniff")
        .send(result);
    } catch (err) {
      res
        .setHeader(
          "Content-Security-Policy",
          `script-src 'self' 'nonce-${nonce}'; object-src 'none'; img-src 'self' data:; frame-ancestors *`
        )
        .send(getErrorHtml("حدث خطأ في تحميل الاعلان", nonce));
    }
  });

  /**
   * Stream video content
   */
  streamVideo = asyncHandler(async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        status: "error",
        message: "URL is required",
      });
    }

    try {
      const response = await axios.get(url, {
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      res.setHeader("Content-Type", response.headers["content-type"]);
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("X-Content-Type-Options", "nosniff");

      response.data.pipe(res);
    } catch (err) {
      logger.error(`Streaming error: ${err.message}`);
      res.status(500).json({
        status: "error",
        message: "Failed to stream video",
      });
    }
  });

  /**
   * Report advertisement
   */
  reportAd = asyncHandler(async (req, res) => {
    const result = await PublisherFacade.reportAd({
      body: req.body,
    });

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  });
}

export default new PublisherController();
