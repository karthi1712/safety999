const Incident = require("../models/Incident");

// CREATE
exports.createIncident = async (req, res) => {
  try {
    const { title, description, category, severity, lat, lng } = req.body;

    if (!title || !lat || !lng) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const incident = await Incident.create({
      title,
      description,
      category,
      severity,
      location: {
        type: "Point",
        coordinates: [lng, lat]
      }
    });

    req.io.emit("newIncident", incident);

    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
exports.getAllIncidents = async (req, res) => {
  const data = await Incident.find().sort({ createdAt: -1 });
  res.json(data);
};

// GET NEARBY
exports.getNearbyIncidents = async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  const data = await Incident.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius)
      }
    }
  });

  res.json(data);
};