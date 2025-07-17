import asyncHandler from "express-async-handler";
import MerchantFacade from "../facade/MerchantFacade.mjs";

class MerchantController {
  /**
   * Create a new merchant application
   */
  createMerchantApp = asyncHandler(async (req, res) => {
    const result = await MerchantFacade.createMerchantApp({
      body: req.body,
      userId: req.user.id,
    });

    res.status(201).json({
      status: "success",
      message: result,
    });
  });
  /**
   * get merchant application
   */
  getMerchantApp = asyncHandler(async (req, res) => {
    const result = await MerchantFacade.getMerchantApp({
      userId: req.user.id,
    });

    res.status(201).json({
      result,
    });
  });
}

export default new MerchantController();
