//src/actions/query_parser.js

import { createTaskCard } from "../state/task_manager.js";

export const parseQuery = (query) => {
  const keywords = [];
  const actionItems = [];

  // Define keywords and action patterns
  const actionPatterns = {
    "summarize logs": /summarize logs|analyze logs|log summary/i,
    "compress memory": /compress memory|optimize memory|reduce memory/i,
    "create head": /create head|initialize head|new head/i,
  };

  // Extract action items from query
  for (const [action, pattern] of Object.entries(actionPatterns)) {
    if (pattern.test(query)) {
      actionItems.push(action);
    }
  }

  // Extract keywords (simple split for demonstration; improve as needed)
  query
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .forEach((word) => keywords.push(word));

  // Create task card for identified actions
  if (actionItems.length > 0) {
    const taskCard = createTaskCard(query, actionItems);
    return { keywords, actionItems, taskCardId: taskCard.id };
  }

  return { keywords, actionItems, taskCardId: null };
};

