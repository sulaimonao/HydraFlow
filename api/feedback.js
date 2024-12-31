// api/feedback.js
import {
  insertFeedback,
  getFeedbackLog,
  generateFeedbackSummary,
  fetchFeedbackByUser,
} from "../../src/util/db_helpers.js";
import { logInfo, logError } from "../../src/util/logger.js";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      logInfo("Processing POST request for feedback submission.");

      // Validate request body
      const { userFeedback, rating, userId } = req.body;
      if (!userFeedback || !rating || !userId) {
        logError("Invalid feedback submission request: missing fields.");
        return res
          .status(400)
          .json({ error: "Feedback, rating, and user ID are required." });
      }

      if (rating < 1 || rating > 5) {
        logError("Invalid rating value submitted.");
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5." });
      }

      // Check for duplicate feedback
      const existingFeedback = await fetchFeedbackByUser(userId, userFeedback);
      if (existingFeedback) {
        logError("Duplicate feedback entry detected.");
        return res
          .status(409)
          .json({ error: "Duplicate feedback entry detected." });
      }

      // Insert feedback into the database
      const feedback = await insertFeedback({ userId, userFeedback, rating });
      logInfo("Feedback submitted successfully.");
      return res
        .status(201)
        .json({ message: "Feedback submitted successfully.", feedback });
    } else if (req.method === "GET") {
      logInfo("Processing GET request for feedback retrieval.");

      // Determine query type
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
        return res
          .status(400)
          .json({ error: 'Invalid query type. Use "all" or "summary".' });
      }
    } else {
      logError(`Invalid HTTP method: ${req.method}`);
      res.setHeader("Allow", ["POST", "GET"]);
      return res
        .status(405)
        .end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logError(`Error in feedback API: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
}
