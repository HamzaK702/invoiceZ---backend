import express from "express";
import businessController from "../controllers/businessController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/search-businesses", authenticateJWT, businessController.searchBusinessesController);

router.get("/business/:businessId", authenticateJWT, businessController.getBusinessById);


export default router;
