const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    examType: {
      type: String,
      enum: ["assignment", "quiz", "midterm", "final", "project"],
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    gradeLetter: {
      type: String,
      trim: true, // optional, can be computed server-side
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    term: {
      type: String,
      trim: true, // e.g. "2025-Fall"
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate grading entries for the same assessment
gradeSchema.index(
  { class: 1, student: 1, subject: 1, examType: 1, term: 1 },
  { unique: true }
);

module.exports = mongoose.model("Grade", gradeSchema);