import User from "../../DB/models/userModel.js";
import fetch from "node-fetch";
import { OAuth2Client } from "google-auth-library";
import { sendResetEmail } from "./emailService.js";
import { generateToken } from "../middlewares/authMiddleware.js";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userSignUp = async (name, email, password, confirmPassword) => {
  try {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const user = new User({ name, email, password });
    await user.save();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const userSignIn = async (email, password) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Incorrect email or password");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new Error("Incorrect email or password");
    }

    return user;
  } catch (error) {
    throw new Error(error.message || "An error occurred during authentication");
  }
};

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.sub) {
      throw new Error("Google ID not found");
    }

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
      });
    }
    return user;
  } catch (error) {
    console.error("Error verifying token:", error.message);
    throw new Error("Invalid Google ID token");
  }
};

const verifyFacebookToken = async (accessToken) => {
  try {
    const appAccessTokenResponse = await fetch(
      `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&grant_type=client_credentials`
    );
    const appAccessTokenData = await appAccessTokenResponse.json();
    const appAccessToken = appAccessTokenData.access_token;
    // console.log("App Access Token:", appAccessToken);

    const debugTokenResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`
    );
    const debugTokenData = await debugTokenResponse.json();
    // console.log("Debug Token Data:", debugTokenData);

    if (
      !debugTokenData.data.is_valid ||
      debugTokenData.data.app_id !== process.env.FACEBOOK_APP_ID
    ) {
      throw new Error("Invalid Facebook access token");
    }

    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    const userData = await userResponse.json();

    let email = userData.email;
    if (!email) {
      email = `facebook-${userData.id}@noemail.com`;
    }

    let user = await User.findOne({ facebookId: userData.id });
    if (!user) {
      user = await User.create({
        facebookId: userData.id,
        email: email,
        name: userData.name,
      });
    }
    return user;
  } catch (error) {
    throw new Error(`Error verifying Facebook access token: ${error.message}`);
  }
};

const sendPasswordResetOTP = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return;
  }

  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  user.isOTPVerified = false;

  await user.save();

  await sendResetEmail(user.email, otp);
};

const verifyOTPCode = async (email, otp) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required.");
  }

  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired OTP.");
  }

  user.isOTPVerified = true;
  await user.save();

  const resetToken = generateToken(user, "15m");

  return resetToken;
};

const resetUserPassword = async (resetToken, password, confirmPassword) => {
  if (!resetToken) {
    throw new Error("Unauthorized access.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error(`Invalid or expired token. ${err}`);
  }

  const user = await User.findById(decoded.id);

  if (!user || !user.isOTPVerified) {
    throw new Error("Unauthorized or invalid request.");
  }

  user.password = password;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpires = undefined;
  user.isOTPVerified = false;

  await user.save();
};

export default {
  userSignUp,
  userSignIn,
  verifyGoogleToken,
  verifyFacebookToken,
  sendPasswordResetOTP,
  verifyOTPCode,
  resetUserPassword,
};
