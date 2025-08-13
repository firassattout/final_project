import asyncHandler from "express-async-handler";
import PaymentFacade from "../facade/PaymentFacade.mjs";

class PaymentController {
  /**
   * Create a new merchant application
   */
  createMerchantApp = asyncHandler(async (req, res) => {
    const result = await PaymentFacade.createMerchantApp({
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
    const result = await PaymentFacade.getMerchantApp({
      userId: req.user.id,
    });

    res.status(201).json({
      result,
    });
  });
  /**
   * delete merchant application
   */
  deleteMerchantApp = asyncHandler(async (req, res) => {
    const result = await PaymentFacade.deleteMerchantApp({
      userId: req.user.id,
      appId: req.params.appId,
    });

    res.status(201).json({
      result,
    });
  });
  /**
   * get transaction
   */
  getTransactionByProgram = asyncHandler(async (req, res) => {
    const result = await PaymentFacade.getTransactionByProgram({
      userId: req.user.id,
      ...req.body,
    });

    res.status(200).json({
      result,
    });
  });
  /**
   * get transaction
   */
  getTransaction = asyncHandler(async (req, res) => {
    const result = await PaymentFacade.getTransaction({
      userId: req.user.id,
      ...req.body,
    });

    res.status(200).json({
      result,
    });
  });
}

export default new PaymentController();
