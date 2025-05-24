import AnalyticFacade from "../facade/AnalyticFacade.mjs";
import asyncHandler from "express-async-handler";

class AnalyticController {
  publisherAnalytics = asyncHandler(async (req, res) => {
    const result = await AnalyticFacade.publisherAnalytics(req);
    res.send(result);
  });

  advertiserAnalytics = asyncHandler(async (req, res) => {
    const result = await AnalyticFacade.advertiserAnalytics(req);
    res.send(result);
  });

  adminAnalytics = asyncHandler(async (req, res) => {
    const result = await AnalyticFacade.adminAnalytics(req);
    res.send(result);
  });
}

export default new AnalyticController();
