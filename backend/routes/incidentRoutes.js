const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createIncident,
  getAllIncidents,
  getNearbyIncidents,
  getDSAInsights,
  getDailyIncidentTrend
} = require("../controllers/incidentController.js");

router.post("/", protect, createIncident);
router.get("/", protect, getAllIncidents);
router.get("/near", protect, getNearbyIncidents);
router.get("/dsa", protect, getDSAInsights);
router.get("/trend", protect, getDailyIncidentTrend);

module.exports = router;