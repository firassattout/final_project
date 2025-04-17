import express from "express";
import AdController from "../controllers/AdController.mjs";
import { validateAdData } from "../utils/validation.js";

const adRoutes = express.Router();
const adController = new AdController();

adRoutes.post("/", validateAdData, adController.createAd.bind(adController));
adRoutes.get("/", adController.getAllAds.bind(adController));
adRoutes.get("/:id", adController.getAd.bind(adController));
adRoutes.put("/:id", validateAdData, adController.updateAd.bind(adController));
adRoutes.delete("/:id", adController.deleteAd.bind(adController));
adRoutes.post("/:id/click", adController.trackClick.bind(adController));
adRoutes.post(
  "/:id/impression",
  adController.trackImpression.bind(adController)
);

export default adRoutes;
