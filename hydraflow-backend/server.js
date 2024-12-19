import express from "express";
import cors from "cors";
import feedbackRoutes from "./routes/feedback.js";

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/feedback", feedbackRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
