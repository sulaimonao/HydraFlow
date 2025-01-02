// api/parse-query.js
import { createTaskCard } from "../src/state/index.js";
import { logInfo, logError } from "../src/util/index.js";

export default async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      logError("Invalid query string received.");
      return res.status(400).json({ error: "A valid query string is required." });
    }

    logInfo(`Parsing query: ${query}`);

    const actionItems = [];
    const extractedDetails = {};

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

    const priority = query.toLowerCase().includes("urgent") ? "High" : "Normal";

    const taskCard = createTaskCard(query, actionItems, priority, extractedDetails);

    logInfo("Query parsed successfully and task card created.");

    res.status(200).json({
      keywords: query.split(" ").filter((word) => word.length > 2),
      actionItems,
      taskCard,
      message: "Query parsed successfully.",
    });
  } catch (error) {
    logError(`Error in parse-query: ${error.message}`);
    res.status(500).json({ error: "Failed to parse query. Please try again." });
  }
};
