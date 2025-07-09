import asyncHandler from "express-async-handler";
import AdminFacade from "../facade/AdminFacade.mjs";

class AdminController {
  /**
   * Handle user deactivation
   */
  userDeactivation = asyncHandler(async (req, res) => {
    const result = await AdminFacade.handleDeactivation(req.params);
    res.status(200).json(result);
  });

  /**
   * Get users
   */
  getUser = asyncHandler(async (req, res) => {
    const result = await AdminFacade.getUser(req.params);
    res.status(200).json(result);
  });

  /**
   * Get company types
   */
  getCompanyType = asyncHandler(async (req, res) => {
    const result = await AdminFacade.getCompanyType();
    res.status(200).json(result);
  });

  /**
   * Get advertisements
   */
  getAd = asyncHandler(async (req, res) => {
    const result = await AdminFacade.getAd({
      userIdFromToken: req.user?.id,
      adId: req.body?.adId,
      searchKey: req.body?.searchKey,
      page: req.body?.page,
      limit: req.body?.limit,
    });
    res.status(200).json(result);
  });

  /**
   * Get user
   */
  getOneUser = asyncHandler(async (req, res) => {
    const result = await AdminFacade.getOneUser({
      userId: req.body?.userId,
      adId: req.body?.adId,
      query: req.query,
    });
    res.status(200).json(result);
  });

  /**
   * Get user
   */
  changeStateAd = asyncHandler(async (req, res) => {
    const result = await AdminFacade.changeStateAd({
      adId: req.body?.adId,
    });
    res.status(200).json(result);
  });
}

export default new AdminController();
