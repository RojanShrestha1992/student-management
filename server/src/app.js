const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const teacherRoutes = require("./routes/teacher/teacherRoutes");
const studentRoutes = require("./routes/student/studentRoutes");

const app = express();

app.use(
	cors({
		origin: (origin, callback) => {
			const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
			if (!origin || origin === allowedOrigin || /\.vercel\.app$/i.test(new URL(origin).hostname) || origin.includes("localhost")) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	})
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
	res.status(200).json({ message: "Student Management API is running" });
});

app.get("/api/v1/health", (req, res) => {
	res.status(200).json({ message: "Server is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/student", studentRoutes);

app.use((req, res) => {
	res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal server error";

	res.status(statusCode).json({
		message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
});

module.exports = app;
