const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // hides password unless explicitly selected
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Shared profile fields
    profile: {
      phone: { type: String, trim: true },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      dob: { type: Date },
      address: { type: String, trim: true },
      avatarUrl: { type: String, trim: true },
    },

    // Teacher-only metadata
    teacherDetails: {
      employeeId: { type: String, trim: true, unique: true, sparse: true },
      department: { type: String, trim: true },
      assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    },

    // Student-only metadata
    studentDetails: {
      rollNumber: { type: String, trim: true, unique: true, sparse: true },
      admissionNumber: { type: String, trim: true, unique: true, sparse: true },
      class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      guardianName: { type: String, trim: true },
      guardianPhone: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare plain password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);