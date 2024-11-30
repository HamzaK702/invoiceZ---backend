import jwt from "jsonwebtoken";
import User from "../../DB/models/userModel.js";

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) throw new Error("User not found");
    next();
  } catch (error) {
    res.status(401).send("Invalid token");
  }
};

export const generateToken = (user, expiresIn = "30d") => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};
