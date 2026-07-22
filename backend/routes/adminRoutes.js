const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/authMiddleware");

const {
  getDashboard,
  getAllUsers,
  getAllIncidentsAdmin,
  updateIncidentStatus,
  deleteIncident
} = require("../controllers/adminController");

router.post("/dashboard", protect, isAdmin, getDashboard);
router.post("/users", protect, isAdmin, getAllUsers);
router.post("/incidents", protect, isAdmin, getAllIncidentsAdmin);
router.put("/incidents/:id/status", protect, isAdmin, updateIncidentStatus);
router.delete("/incidents/:id", protect, isAdmin, deleteIncident);

module.exports = router;