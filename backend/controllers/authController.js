const User = require("../models/User");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const user = await User.create({ name, email, password, mobile });

    res.json({ msg: "User registered successfully", user });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};