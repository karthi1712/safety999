const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Incident = require("../models/Incident");
const connectDB = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "safety-secret";

let fallbackState = null;

const getModel = async (modelName) => {
  if (fallbackState) {
    return fallbackState[modelName];
  }

  const dbInfo = await connectDB();
  fallbackState = dbInfo.fallbackModels || null;
  if (fallbackState) {
    return fallbackState[modelName];
  }

  return modelName === "User" ? User : Incident;
};

const safeUserResponse = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  return userObject;
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const UserModel = await getModel("User");
    const existing = await UserModel.findOne({ email });

    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const user = await UserModel.create({ name, email, password, mobile, role: "user" });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ msg: "User registered successfully", token, user: safeUserResponse(user) });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, lat, lng } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    const UserModel = await getModel("User");
    const user = await UserModel.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Update last login and location
    user.lastLogin = new Date();
    if (lat && lng) {
      user.location = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ msg: "Login successful", token, user: safeUserResponse(user) });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// SUMMARY
exports.summary = async (req, res) => {
  try {
    const UserModel = await getModel("User");
    const IncidentModel = await getModel("Incident");
    const userCount = await UserModel.countDocuments();
    const incidentCount = await IncidentModel.countDocuments();
    const resolvedCount = await IncidentModel.countDocuments({ status: "resolved" });
    const criticalCount = await IncidentModel.countDocuments({ severity: "critical" });
    const recentIncidents = await IncidentModel.find().sort({ createdAt: -1 }).limit(5);

    res.json({ userCount, incidentCount, resolvedCount, criticalCount, recentIncidents });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const UserModel = await getModel("User");
    const user = await UserModel.findOne({ email }).select("notifications");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const UserModel = await getModel("User");
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.notifications = user.notifications.map((note) => ({
      ...note.toObject(),
      read: true
    }));
    await user.save();

    res.json(user.notifications);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { email, lat, lng } = req.body;
    if (!email || lat == null || lng == null) {
      return res.status(400).json({ msg: "Email, lat and lng required" });
    }

    const UserModel = await getModel("User");
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.location = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };
    user.lastLogin = new Date();
    await user.save();

    res.json({ msg: "Location updated" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};