import express from "express";
import itemsController from "../controllers/itemsController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/:invoiceId",authenticateJWT,itemsController.getItemsController);

router.get("/:invoiceId/:itemId",authenticateJWT,itemsController.getItemByIdController);

router.post("/:invoiceId",authenticateJWT,itemsController.createItemController);

router.patch("/:invoiceId/:itemId",authenticateJWT,itemsController.updateItemController);

router.delete("/:invoiceId/:itemId",authenticateJWT,itemsController.deleteItemController);

export default router;
