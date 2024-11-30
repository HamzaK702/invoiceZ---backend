import express from "express";
import { authenticateJWT } from './../middlewares/authMiddleware.js';
import upload from './../fileUpload/multer.js';
import userController from "../controllers/userController.js";


const router = express.Router();

router.get('/profile', authenticateJWT, userController.getUserProfileController);

router.patch('/profile', authenticateJWT, upload.single('profilePhoto'), userController.updateProfileController);

export default router;
