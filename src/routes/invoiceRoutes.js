import express from "express";
import invoiceController from "../controllers/invoiceController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-invoice", authenticateJWT,invoiceController.createInvoiceController);

router.post("/:invoiceId/generate-pdf", authenticateJWT,invoiceController.createInvoiceController);

router.get("/fetch-abn-details", invoiceController.fetchABNDetailsController);

router.get('/items-by-user', authenticateJWT, invoiceController.getAllItemsByUserController);

router.get("/user-invoices", authenticateJWT, invoiceController.getInvoicesByUserController);

router.get("/:invoiceId", authenticateJWT, invoiceController.getInvoiceByIdController);

router.patch("/update/:invoiceId", authenticateJWT, invoiceController.patchInvoiceController);

router.delete("/:invoiceId", authenticateJWT, invoiceController.deleteInvoiceController);

export default router;
