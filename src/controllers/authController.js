import User from "../../DB/models/userModel.js";
import { generateToken } from "../middlewares/authMiddleware.js";
import authService from "../services/authService.js";

const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const user = await authService.userSignUp(
      name,
      email,
      password,
      confirmPassword
    );
    res
      .status(201)
      .json({ success: true, message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.userSignIn(email, password);
    const token = generateToken(user);
    res.json({ success: true, user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const googleOAuthSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }
    const user = await authService.verifyGoogleToken(idToken);
    const token = generateToken(user);
    res.json({ success: true, user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const facebookOAuthSignIn = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: "accessToken is required" });
    }
    const user = await authService.verifyFacebookToken(accessToken);
    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not found. Please check and try again.",
      });
    }

    await authService.sendPasswordResetOTP(email);

    res.status(200).json({
      success: true,
      message: "The OTP has been sent to your email.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while sending the email." });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const resetToken = await authService.verifyOTPCode(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const resetToken = req.headers["x-reset-token"];
    // console.log(resetToken);

    await authService.resetUserPassword(resetToken, password, confirmPassword);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  register,
  login,
  googleOAuthSignIn,
  facebookOAuthSignIn,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
