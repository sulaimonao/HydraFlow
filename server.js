import express from "express";
import feedbackRoutes from "./routes/feedback.js";

const app = express();
app.use(express.json());

// Feedback routes
app.use("/api/feedback", feedbackRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
