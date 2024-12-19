const feedbackLog = []; // Temporary in-memory storage (replace with DB if needed)

// Collect feedback
export const collectFeedback = ({ responseId, userFeedback, rating }) => {
  const feedbackEntry = {
    responseId,
    userFeedback,
    rating,
    timestamp: new Date().toISOString(),
  };

  feedbackLog.push(feedbackEntry);
  console.log("Feedback Collected:", feedbackEntry);
  return { status: "success", message: "Feedback recorded successfully." };
};

// Get all feedback logs
export const getFeedbackLog = () => {
  return feedbackLog;
};

// Generate summarized insights
export const generateFeedbackSummary = () => {
  const totalFeedback = feedbackLog.length;
  const averageRating =
    feedbackLog.reduce((sum, entry) => sum + entry.rating, 0) / totalFeedback || 0;

  const insights = {
    totalFeedback,
    averageRating: parseFloat(averageRating.toFixed(2)),
    feedbackEntries: feedbackLog,
  };

  console.log("Generated Feedback Summary:", insights);
  return insights;
};
