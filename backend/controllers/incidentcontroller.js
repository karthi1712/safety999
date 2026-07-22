const Incident = require("../models/Incident");
const User = require("../models/user");
const HashMap = require("../dsa/HashMap");
const PriorityQueue = require("../dsa/PriorityQueue");
const mergeSort = require("../dsa/MergeSort");

const normalizePriority = (severity) => {
  const rank = { critical: 4, high: 3, medium: 2, low: 1 };
  return rank[severity] || 1;
};

const prioritizeIncident = (severity) => {
  if (!severity) return "low";
  const normalized = severity.toLowerCase();
  if (normalized === "critical") return "critical";
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  return "low";
};

// CREATE
exports.createIncident = async (req, res) => {
  try {
    const { title, description, category, severity, lat, lng, area } = req.body;
    const reportedBy = req.user?._id || null;

    if (!title || !lat || !lng) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const priority = prioritizeIncident(severity);
    const incidentId = `INC-${Date.now().toString().slice(-6)}`;

    const incident = await Incident.create({
      title,
      description,
      category: category || "general",
      severity: severity || "low",
      priority,
      reportedBy,
      area: area || "Unknown Area",
      incidentId,
      status: "pending",
      location: {
        type: "Point",
        coordinates: [lng, lat]
      }
    });

    let nearbyUsers = [];
    try {
      nearbyUsers = await User.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat]
            },
            $maxDistance: 50000
          }
        }
      });
    } catch (geoErr) {
      console.warn("⚠️ Nearby user lookup failed:", geoErr.message);
      nearbyUsers = [];
    }

    for (const user of nearbyUsers) {
      user.notifications.push({
        incidentId: incident._id,
        message: `New ${priority} priority incident near ${area || "your area"}`,
        read: false
      });
      await user.save();
    }

    req.io.emit("newIncident", incident);
    req.io.emit("notificationUpdate", { userIds: nearbyUsers.map((user) => user._id) });

    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
exports.getAllIncidents = async (req, res) => {
  try {
    const { search, category, severity, status, sortBy = "date" } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
        { incidentId: { $regex: search, $options: "i" } }
      ];
    }

    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const incidents = await Incident.find(filter).populate("reportedBy", "name email").sort({ createdAt: -1 });
    const sortedIncidents = mergeSort([...incidents], sortBy === "severity" ? "severity" : sortBy === "priority" ? "priority" : "date");

    res.json(sortedIncidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  }).populate("reportedBy", "name email");

  res.json(data);
};

exports.getDSAInsights = async (req, res) => {
  try {
    const incidents = await Incident.find().lean();
    const incidentMap = new HashMap();
    incidents.forEach((incident) => incidentMap.set(incident.incidentId || incident._id, incident));

    const priorityQueue = new PriorityQueue();
    incidents.forEach((incident) => {
      priorityQueue.enqueue(incident, normalizePriority(incident.priority || incident.severity));
    });

    const topQueue = [];
    while (priorityQueue.size() && topQueue.length < 5) {
      topQueue.push(priorityQueue.dequeue().value);
    }

    res.json({
      totalIncidents: incidents.length,
      incidentLookup: incidentMap.entries(),
      priorityQueue: topQueue,
      latest: incidents.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDailyIncidentTrend = async (req, res) => {
  try {
    const trend = await Incident.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};