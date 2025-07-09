import asyncHandler from "express-async-handler";
import AdvertiserFacade from "../facade/AdvertiserFacade.mjs";
import logger from "../utils/logger.mjs";

class AdvertiserController {
  /**
   * Create a new advertisement
   */
  createAd = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.createAd({
      body: req.body,
      userIdFromToken: req.user?.id,
    });
    res.status(201).json(result);
  });

  /**
   * Check advertisement value
   */
  valueCheck = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.valueCheck({
      body: req.body,
      userIdFromToken: req.user?.id,
    });
    res.status(200).json(result);
  });

  /**
   * Edit an existing advertisement
   */
  editAd = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.editAd({
      body: req.body,
      userIdFromToken: req.user?.id,
    });
    res.status(200).json(result);
  });

  /**
   * Get advertisements
   */
  getAd = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.getAd({
      userIdFromToken: req.user?.id,
      adId: req.body?.adId,
      searchKey: req.body?.searchKey,
    });
    res.status(200).json(result);
  });

  /**
   * Get media for an advertisement
   */
  getMedia = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.getMedia({
      adId: req.body.id,
    });
    res.status(200).json(result);
  });

  /**
   * Add media to an advertisement
   */
  addMedia = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.addMedia({
      body: req.body,
      files: req.files,
      userIdFromToken: req.user?.id,
    });
    res.status(201).json(result);
  });

  changeStateAd = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.changeStateAd({
      adId: req.body?.adId,
      userId: req.user?.id,
    });
    res.status(201).json(result);
  });
}

export default new AdvertiserController();
