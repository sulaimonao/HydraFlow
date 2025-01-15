//src/actions/query_parser.js
/**
 * Parses the user query to extract keywords and actionable tasks.
 * @param {string} query - The input query from the user.
 * @returns {Object} - Extracted keywords and identified action items.
 */
function parseQuery(query) {
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    throw new Error("❌ Invalid query input. Must be a non-empty string.");
  }

  // 🔍 Extract meaningful keywords (excluding short/common words)
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));

  // 📖 Define a dynamic map of keywords to actions
  const actionMap = {
    "summarize logs": "summarize-logs",
    "create head": "create-subpersona",
    "create persona": "create-subpersona",
    "optimize memory": "compress-memory",
    "compress memory": "compress-memory",
    "fetch metrics": "fetch-gauge-metrics",
    "generate report": "generate-report",
    "analyze feedback": "analyze-feedback",
    "clear history": "clear-history",
    "update context": "update-context"
  };

  const actionItems = [];

  // 📝 Detect actions in the query using flexible pattern matching
  Object.keys(actionMap).forEach(pattern => {
    const regex = new RegExp(`\\b${pattern}\\b`, "i");  // Ensures full-word matching
    if (regex.test(query)) {
      actionItems.push(actionMap[pattern]);
    }
  });

  // ⚠️ Fallback if no action is detected
  if (actionItems.length === 0) {
    console.warn("⚠️ No specific action identified in the query.");
  }

  return { keywords, actionItems };
}

// 🚫 Common words to exclude from keywords
const commonWords = new Set([
  "the", "and", "for", "with", "from", "this", "that", "have", "will", "but",
  "you", "your", "are", "was", "were", "can", "what", "which", "when", "where",
  "how", "why", "who", "whom", "about", "into", "onto", "over", "under", "to"
]);

export { parseQuery };
