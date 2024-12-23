// parse-query.js

export default async (req, res) => {
  try {
    const { query } = req.body;

    // Validate input
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // Process the query for natural language input
    const actionItems = [];
    const extractedDetails = {};

    // Identify specific actions based on keywords
    if (/summarize.*logs/i.test(query)) {
      actionItems.push("summarize-logs");
      extractedDetails.summarize = "Summarize the provided logs for key patterns and errors.";
    }

    if (/create.*persona/i.test(query)) {
      actionItems.push("create-subpersona");
      const personaDescriptionMatch = query.match(/create.*persona.*(?:like|inspired by)?\s(.*)/i);
      extractedDetails.personaDescription =
        personaDescriptionMatch?.[1] ||
        "A generic persona tailored for dynamic user interaction.";
    }

    // Construct structured data for tasks
    const taskCard = {
      goal: query,
      priority: "High", // Default priority for tasks
      subtasks: actionItems.map((item) => ({
        task: item,
        status: "pending",
        description: extractedDetails[item] || null,
      })),
    };

    // Respond with extracted data and structured tasks
    res.status(200).json({
      keywords: query.split(" "), // Basic keyword extraction
      actionItems,
      taskCard,
      message: "Query parsed successfully.",
    });
  } catch (error) {
    console.error("Error in parse-query:", error);
    res.status(500).json({ error: "Failed to parse query." });
  }
};
