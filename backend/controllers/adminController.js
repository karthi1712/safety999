const User = require("../models/user");
const Incident = require("../models/Incident");
const Graph = require("../dsa/Graph");
const dijkstra = require("../dsa/Dijkstra");
const bfs = require("../dsa/BFS");
const dfs = require("../dsa/DFS");

// GET ADMIN DASHBOARD DATA
exports.getDashboard = async (req, res) => {
  try {
    const admin = req.user;

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized: Admin access required" });
    }

    const totalUsers = await User.countDocuments();
    const totalIncidents = await Incident.countDocuments();
    const resolvedIncidents = await Incident.countDocuments({ status: "resolved" });
    const criticalIncidents = await Incident.countDocuments({ severity: "critical" });

    const recentIncidents = await Incident.find()
      .populate("reportedBy", "name email mobile")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentLogins = await User.find()
      .select("name email lastLogin role")
      .sort({ lastLogin: -1 })
      .limit(10);

    const incidentsByStatus = await Incident.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const incidentsBySeverity = await Incident.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);

    const areaCounts = await Incident.aggregate([
      { $group: { _id: "$area", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const graph = new Graph();
    ["Police Station", "Hospital", "Central Market", "North Zone", "South Zone", "West Zone"].forEach((vertex) => graph.addVertex(vertex));
    graph.addEdge("Police Station", "Central Market", 3);
    graph.addEdge("Hospital", "Central Market", 2);
    graph.addEdge("Central Market", "North Zone", 4);
    graph.addEdge("Central Market", "South Zone", 5);
    graph.addEdge("North Zone", "West Zone", 2);
    graph.addEdge("South Zone", "West Zone", 3);

    const shortestRoute = dijkstra(graph, "Police Station");
    const nearestService = bfs(graph, "Central Market");
    const zoneTraversal = dfs(graph, "North Zone");

    res.json({
      totalUsers,
      totalIncidents,
      resolvedIncidents,
      criticalIncidents,
      recentIncidents,
      recentLogins,
      incidentsByStatus,
      incidentsBySeverity,
      areaCounts,
      dsaSummary: {
        shortestRoute,
        nearestService,
        zoneTraversal
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const admin = req.user;

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized: Admin access required" });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL INCIDENTS
exports.getAllIncidentsAdmin = async (req, res) => {
  try {
    const admin = req.user;

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized: Admin access required" });
    }

    const incidents = await Incident.find()
      .populate("reportedBy", "name email mobile")
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE INCIDENT STATUS
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const incidentId = req.params.id;
    const admin = req.user;

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized: Admin access required" });
    }

    const incident = await Incident.findByIdAndUpdate(
      incidentId,
      { status },
      { new: true }
    );

    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE INCIDENT
exports.deleteIncident = async (req, res) => {
  try {
    const incidentId = req.params.id;
    const admin = req.user;

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized: Admin access required" });
    }

    await Incident.findByIdAndDelete(incidentId);
    res.json({ msg: "Incident deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};