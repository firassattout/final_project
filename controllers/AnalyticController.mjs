import asyncHandler from "express-async-handler";
import AnalyticFacade from "../facade/AnalyticFacade.mjs";

class AnalyticController {
  /**
   * Get publisher analytics
   */
  publisherAnalytics = asyncHandler(async (req, res) => {
    const result = await AnalyticFacade.publisherAnalytics({
      userIdFromToken: req.user?.id,
      query: req.query,
      adId: req.body?.adId,
    });
    res.status(200).json(result);
  });

  /**
   * Get advertiser analytics
   */
  advertiserAnalytics = asyncHandler(async (req, res) => {
    const result = await AnalyticFacade.advertiserAnalytics({
      userIdFromToken: req.user?.id,
      query: req.query,
      adId: req.body?.adId,
    });
    res.status(200).json(result);
  });

  /**
   * Get admin analytics
   */
  adminAnalytics = asyncHandler(async (req, res) => {
    const result = await AnalyticFacade.adminAnalytics({
      query: req.query,
    });
    res.status(200).json(result);
  });
}

export default new AnalyticController();
