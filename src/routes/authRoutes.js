import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

// Sign up
router.post("/signup", authController.register);

// Sign in
router.post("/signin", authController.login);

//Sign in with Google
router.post("/oauth/google", authController.googleOAuthSignIn);

//Sign in with Facebook
router.post("/oauth/facebook", authController.facebookOAuthSignIn);

// Forgot Password
router.post("/forget-password", authController.forgotPassword);

// Verify OTP
router.post("/verify-otp", authController.verifyOTP);

// Reset Password
router.post("/reset-password", authController.resetPassword);

export default router;
