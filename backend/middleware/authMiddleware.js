const jwt = require("jsonwebtoken");
const User = require("../models/user");
const connectDB = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "safety-secret";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    let user = await User.findById(decoded.id).select("-password");

    if (!user) {
      const dbInfo = await connectDB();
      if (dbInfo.mode === "fallback" && dbInfo.fallbackModels?.User) {
        user = await dbInfo.fallbackModels.User.findOne({ _id: decoded.id });
      }
    }

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin access required" });
  }
  next();
};

module.exports = protect;
module.exports.isAdmin = isAdmin;
