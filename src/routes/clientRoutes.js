import express from "express";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import clientController from "../controllers/clientController.js";

const router = express.Router();

router.get("/all-clients", authenticateJWT, clientController.getAllClientsController);

router.get("/search-clients", authenticateJWT, clientController.searchClientsController);

router.get("/:clientId", authenticateJWT, clientController.getClientByIdController);

router.get("/:clientId/invoices", authenticateJWT, clientController.getInvoicesByClientIdController);

export default router;
