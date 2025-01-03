// api/feedback.js
import { insertFeedback, getFeedbackLog, generateFeedbackSummary, logInfo, logError } from "../src/util/logger.js";

export default async (req, res) => {
  try {
    if (req.method === "POST") {
      const { userFeedback, rating, userId } = req.body;

      if (!userFeedback || !rating || !userId) {
        logError("Invalid feedback submission request: Missing fields.");
        return res.status(400).json({ error: "Feedback, rating, and user ID are required." });
      }

      if (rating < 1 || rating > 5) {
        logError("Invalid rating value submitted.");
        return res.status(400).json({ error: "Rating must be between 1 and 5." });
      }

      logInfo("Submitting feedback.");
      const feedback = await insertFeedback({ userId, userFeedback, rating });
      return res.status(201).json({ message: "Feedback submitted successfully.", feedback });
    }

    if (req.method === "GET") {
      const { type } = req.query;

      if (type === "all") {
        const feedback = await getFeedbackLog();
        logInfo("All feedback retrieved successfully.");
        return res.status(200).json({ feedback });
      } else if (type === "summary") {
        const summary = await generateFeedbackSummary();
        logInfo("Feedback summary retrieved successfully.");
        return res.status(200).json({ summary });
      } else {
        logError(`Invalid query type: ${type}`);
        return res.status(400).json({ error: 'Invalid query type. Use "all" or "summary".' });
      }
    }

    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    logError(`Error in feedback API: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
};
