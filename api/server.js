// api/server.js
import express from "express";
import cors from "cors";
import feedbackRoutes from "./routes";
import { logInfo, logError } from "../src/util";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  logInfo(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/feedback", feedbackRoutes);
// Additional routes can be added here (e.g., /api/context, /api/tasks)

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  logError(`Error: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logInfo(`Server running on port ${PORT}`);
});
