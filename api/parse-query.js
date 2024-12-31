// api/parse-query.js
import { createTaskCard } from "../src/state/task_manager.js";
import { logInfo, logError } from "../src/util/logger.js";

export default async (req, res) => {
  try {
    const { query } = req.body;

    // Input validation
    if (!query || typeof query !== "string") {
      logError("Invalid query string received.");
      return res.status(400).json({ error: "A valid query string is required." });
    }

    logInfo(`Parsing query: ${query}`);

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

    // Determine priority based on query content
    const priority = query.toLowerCase().includes("urgent") ? "High" : "Normal";

    // Construct a structured task card
    const taskCard = createTaskCard(query, actionItems, priority, extractedDetails);

    logInfo("Query parsed successfully and task card created.");

    // Respond with structured data
    res.status(200).json({
      keywords: query.split(" ").filter((word) => word.length > 2), // Basic keyword extraction
      actionItems,
      taskCard,
      message: "Query parsed successfully.",
    });
  } catch (error) {
    logError(`Error in parse-query: ${error.message}`);
    res.status(500).json({ error: "Failed to parse query. Please try again." });
  }
};
