const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const morgan = require("morgan");
const errorHandler = require("./middleware/error");
const fs = require("fs");

// Load env vars
dotenv.config({ path: "./config/config.env" });
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created");
}
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Create express app
const app = express();

// Body parser
app.use(express.json());
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/case-studies", require("./routes/caseStudies"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/messages", require("./routes/messages"));

// Error handler middleware
app.use(errorHandler);

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Set port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
