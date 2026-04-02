const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Grade 10"
    },
    section: {
      type: String,
      required: true,
      trim: true, // e.g. "A"
    },
    subject: {
      type: String,
      required: true,
      trim: true, // e.g. "Mathematics"
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true, // e.g. "MATH-10-A"
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    schedule: {
      days: [{ type: String, trim: true }], // e.g. ["Mon", "Wed"]
      startTime: { type: String, trim: true }, // "09:00"
      endTime: { type: String, trim: true },   // "10:00"
      room: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who created this class
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate class+section+subject combinations
classSchema.index({ name: 1, section: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Class", classSchema);