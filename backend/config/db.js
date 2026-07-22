const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { createCollectionModel } = require("./memoryStore");

let fallbackStoreActive = false;
let fallbackModels = null;
let cachedConnection = null;
let memoryServer = null;

const createFallbackModels = () => {
  if (fallbackModels) {
    return fallbackModels;
  }

  fallbackModels = {
    User: createCollectionModel("User", "usr"),
    Incident: createCollectionModel("Incident", "inc")
  };
  return fallbackModels;
};

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    let atlasConnected = false;

    if (mongoUri) {
      if (mongoUri.includes("<db_password>") || mongoUri.includes("db_password")) {
        console.warn("⚠️ MongoDB Atlas URI is configured but still contains a password placeholder. Replace it with the real password to connect to Atlas.");
      } else {
        try {
          await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000
          });
          console.log("✅ MongoDB Connected");
          cachedConnection = { mode: "atlas", mongoose };
          atlasConnected = true;
          return cachedConnection;
        } catch (atlasErr) {
          console.warn("⚠️ MongoDB connection failed, falling back to local memory server:", atlasErr.message);
        }
      }
    }

    if (!atlasConnected) {
      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }
      const localMongoUri = memoryServer.getUri();
      await mongoose.connect(localMongoUri, {
        serverSelectionTimeoutMS: 10000
      });
      console.log("✅ Local MongoDB Memory Server Connected");
      cachedConnection = { mode: "memory", mongoose };
      return cachedConnection;
    }
  } catch (err) {
    fallbackStoreActive = true;
    console.warn("⚠️ Falling back to in-process memory store because MongoDB is unavailable:", err.message);
    cachedConnection = { mode: "fallback", mongoose: null, fallbackModels: createFallbackModels() };
    return cachedConnection;
  }
};

module.exports = connectDB;