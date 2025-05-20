import AdvertiserFacade from "../facade/AdvertiserFacade.mjs";
import asyncHandler from "express-async-handler";

class AdvertiserController {
  createAd = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.createAd(req);
    res.json(result);
  });
  valueCheck = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.valueCheck(req);
    res.json(result);
  });
  editAd = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.editAd(req);
    res.json(result);
  });
  getAd = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.getAd(req);
    res.json(result);
  });
  getMedia = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.getMedia(req);
    res.json(result);
  });
  addMedia = asyncHandler(async (req, res) => {
    const result = await AdvertiserFacade.addMedia(req);
    res.json(result);
  });
}

export default new AdvertiserController();
