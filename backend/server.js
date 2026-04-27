require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const incidentRoutes = require("./routes/incidentRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ROUTES
app.use("/api/incidents", incidentRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Backend running");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// START SERVER AFTER DB CONNECT
const start = async () => {
  try {
    console.log("🔌 Connecting DB...");
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🔥 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err.message);
  }
};

start();