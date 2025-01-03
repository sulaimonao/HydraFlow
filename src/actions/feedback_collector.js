// src/actions/feedback_collector.js
import { supabase } from "../util/database/db_helpers.js";
import { logError, logInfo } from "../util/logging/logger.js";

/**
 * Collects user feedback and stores it in the database.
 */
export const collectFeedback = async ({ responseId, userFeedback, rating }) => {
  const feedbackEntry = {
    response_id: responseId,
    user_feedback: userFeedback,
    rating,
    timestamp: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from("feedback_entries").insert([feedbackEntry]);
    if (error) throw error;

    logInfo("Feedback collected successfully.", { data });
    return { status: "success", message: "Feedback recorded successfully.", data };
  } catch (err) {
    logError("Error collecting feedback.", { err });
    return { status: "error", message: "Failed to record feedback." };
  }
};

/**
 * Retrieves feedback logs from the database.
 */
export const getFeedbackLog = async () => {
  try {
    const { data, error } = await supabase.from("feedback_entries").select("*");
    if (error) throw error;

    return { status: "success", message: "Feedback retrieved successfully.", data };
  } catch (err) {
    logError("Error retrieving feedback logs.", { err });
    return { status: "error", message: "Failed to retrieve feedback.", data: [] };
  }
};

/**
 * Generates summarized insights from feedback data.
 */
export const generateFeedbackSummary = async () => {
  try {
    const { data, error } = await supabase.from("feedback_entries").select("rating");
    if (error) throw error;

    const totalFeedback = data.length;
    const averageRating = totalFeedback
      ? parseFloat((data.reduce((sum, entry) => sum + entry.rating, 0) / totalFeedback).toFixed(2))
      : 0;

    const insights = { totalFeedback, averageRating };
    logInfo("Generated feedback summary.", { insights });

    return { status: "success", message: "Feedback summary generated successfully.", insights };
  } catch (err) {
    logError("Error generating feedback summary.", { err });
    return { status: "error", message: "Failed to generate feedback summary.", insights: null };
  }
};
