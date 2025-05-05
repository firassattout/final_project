import AdFacade from "../facade/AdFacade.mjs";
import asyncHandler from "express-async-handler";

class AdController {
  createAd = asyncHandler(async (req, res) => {
    const result = await AdFacade.createAd(req);
    res.json(result);
  });
  valueCheck = asyncHandler(async (req, res) => {
    const result = await AdFacade.valueCheck(req);
    res.json(result);
  });
  editAd = asyncHandler(async (req, res) => {
    const result = await AdFacade.editAd(req);
    res.json(result);
  });
  getAd = asyncHandler(async (req, res) => {
    const result = await AdFacade.getAd(req);
    res.json(result);
  });
  addMedia = asyncHandler(async (req, res) => {
    const result = await AdFacade.addMedia(req);
    res.json(result);
  });
}

export default new AdController();
