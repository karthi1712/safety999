const mongoose = require("mongoose");
const dns = require("dns");

// 🔥 FORCE IPv4 (CRITICAL FIX)
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("✅ MongoDB Atlas Connected");
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;