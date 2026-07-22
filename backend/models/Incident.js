const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    default: "general"
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low"
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  area: String,
  incidentId: String,
  status: {
    type: String,
    enum: ["unverified", "pending", "in-progress", "resolved", "closed"],
    default: "pending"
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  tags: [String],
  responseTime: Number,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { timestamps: true });

IncidentSchema.index({ location: "2dsphere" });
IncidentSchema.index({ category: 1, severity: 1, status: 1 });
IncidentSchema.index({ incidentId: 1 });

module.exports = mongoose.model("Incident", IncidentSchema);