const feedbackLog = []; // Temporary in-memory storage (replace with DB if required)

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

export const getFeedbackLog = () => {
  return feedbackLog;
};
