import express from "express";
import quoteController from "../controllers/quoteController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-quote", authenticateJWT,quoteController.createQuoteController);

router.post("/convert-quote-to-invoice/:id",authenticateJWT,quoteController.convertQuoteToInvoiceController);

router.get("/user-quotes", authenticateJWT, quoteController.getQuotesByUserController);

router.get("/:quoteId", authenticateJWT, quoteController.getQuoteByIdController);

router.patch("/update/:quoteId", authenticateJWT, quoteController.patchQuoteController);

router.delete("/:quoteId", authenticateJWT, quoteController.deleteQuoteController);

export default router;
