// src/actions/query_parser.js (Improved)
/**
 * Parses the user query to extract keywords and actionable tasks.
 * @param {string} query - The input query from the user.
 * @param {object} req - The request object, containing session data.
 * @returns {Object} - Extracted keywords, identified action items, and task card suggestion.
 */
function parseQuery(query, req) {
  if (!query || typeof query !== "string" || query.trim().length === 0) {
      throw new Error("❌ Invalid query input. Must be a non-empty string.");
  }

  // 🔍 Extract meaningful keywords (excluding short/common words)
  const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));

  // 📖 Define a dynamic map of keywords to actions AND descriptions
  const actionMap = {
      "summarize logs": { action: "summarize-logs", description: "Summarize the provided logs for key patterns and errors." },
      "create head": { action: "create-subpersona", description: "Create a new subpersona (head)." },
      "create persona": { action: "create-subpersona", description: "Create a new subpersona." },
      "optimize memory": { action: "compress-memory", description: "Compress and optimize memory usage." },
      "compress memory": { action: "compress-memory", description: "Compress and optimize memory usage." },
      "fetch metrics": { action: "fetch-gauge-metrics", description: "Retrieve system and database metrics." },
      "generate report": { action: "generate-report", description: "Generate a report (details depend on context)." }, // More generic
      "analyze feedback": { action: "analyze-feedback", description: "Analyze user feedback for insights." },
      "clear history": { action: "clear-history", description: "Clear the conversation history." },  // Potentially risky, confirm with user
      "update context": { action: "update-context", description: "Update the current context." },
      // Add more actions here, as needed
      "add task": {action: "add-task", description: "Add a task to the task list"},
      "add subtask": {action: "add-subtask", description: "Add a subtask to an existing task"},
      "show tasks": {action: "show-tasks", description: "Show current tasks"}
  };

  const actionItems = [];
  const extractedDetails = {}; // Store descriptions for each action

  // 📝 Detect actions in the query using flexible pattern matching
  Object.keys(actionMap).forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, "i");  // Ensures full-word matching
      if (regex.test(query)) {
          const action = actionMap[pattern].action;
          actionItems.push(action);
          extractedDetails[action] = actionMap[pattern].description; // Store description
      }
  });

  // ⚠️ Fallback if no action is detected
  if (actionItems.length === 0) {
      console.warn("⚠️ No specific action identified in the query.");
      // Consider adding a default action, like "general-query" or "unknown-intent"
      // actionItems.push("general-query");
      // extractedDetails["general-query"] = "General query handling.";
  }


  // ✨ Suggest a task card based on the query and extracted actions
  const taskCard = {
    goal: query, // Use the original query as the overall goal
    priority: "High", // Default priority, can be adjusted
    subtasks: actionItems.map(item => ({
      task: item,
      status: "pending", // Initial status
      description: extractedDetails[item] || "No additional details provided.", // Use extracted description
    })),
  };

  return {
      keywords,
      actionItems,
      taskCard, // Include the suggested task card
      userId: req.session.userId,
      chatroomId: req.session.chatroomId
  };
}

// 🚫 Common words to exclude from keywords (Expand this list as needed)
const commonWords = new Set([
  "the", "and", "for", "with", "from", "this", "that", "have", "will", "but",
  "you", "your", "are", "was", "were", "can", "what", "which", "when", "where",
  "how", "why", "who", "whom", "about", "into", "onto", "over", "under", "to",
  "a", "an", "in", "on", "at", "by", "of", "is", "it", "i" // Add more common words
]);

export { parseQuery };