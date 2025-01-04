// parse-query.js

export default async (req, res) => {
  try {
    const { query } = req.body;

    // Input validation
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "A valid query string is required." });
    }

    // Initialize tasks and details
    const actionItems = [];
    const extractedDetails = {};

    // Extract specific actions based on keywords
    if (/summarize.*logs/i.test(query)) {
      actionItems.push("summarize-logs");
      extractedDetails["summarize-logs"] = "Summarize the provided logs for key patterns and errors.";
    }

    if (/create.*persona/i.test(query)) {
      actionItems.push("create-subpersona");
      const personaDescriptionMatch = query.match(/create.*persona.*(?:like|inspired by)?\s(.*)/i);
      extractedDetails["create-subpersona"] =
        personaDescriptionMatch?.[1] || "Generic persona for dynamic user interaction.";
    }

    // Construct a structured task card
    const taskCard = {
      goal: query,
      priority: "High", // Default priority for tasks
      subtasks: actionItems.map((item) => ({
        task: item,
        status: "pending",
        description: extractedDetails[item] || "No additional details provided.",
      })),
    };

    // Respond with structured data
    res.status(200).json({
      keywords: query.split(" "), // Basic keyword extraction
      actionItems,
      taskCard,
      message: "Query parsed successfully.",
    });
  } catch (error) {
    console.error("Error in parse-query:", error);
    res.status(500).json({ error: "Failed to parse query. Please try again." });
  }
};
