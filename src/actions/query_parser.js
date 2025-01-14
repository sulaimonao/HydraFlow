//src/actions/query_parser.js
/**
 * Parses the user query to extract keywords and actionable tasks.
 * @param {string} query - The input query from the user.
 * @returns {Object} - Extracted keywords and identified action items.
 */
function parseQuery(query) {
  if (!query || typeof query !== "string") {
    throw new Error("Invalid query input. Must be a non-empty string.");
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
    "optimize memory": "compress-memory",
    "fetch metrics": "fetch-gauge-metrics",
    "generate report": "generate-report"
  };

  const actionItems = [];

  // 📝 Detect actions in the query using the actionMap
  Object.keys(actionMap).forEach(pattern => {
    const regex = new RegExp(pattern, "i"); // Case-insensitive matching
    if (regex.test(query)) {
      actionItems.push(actionMap[pattern]);
    }
  });

  return { keywords, actionItems };
}

// 🚫 Common words to exclude from keywords
const commonWords = new Set([
  "the", "and", "for", "with", "from", "this", "that", "have", "will", "but", "you", "your", "are", "was", "were"
]);

export { parseQuery };
