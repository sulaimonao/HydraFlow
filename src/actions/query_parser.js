// src/actions/query_parser.js
import { createTaskCard } from "../state/task_manager.js";

/**
 * Parses a user query into actionable items.
 */
export const parseQuery = (query) => {
  const keywords = [];
  const actionItems = [];

  const actionPatterns = {
    "summarize logs": /summarize logs|analyze logs/i,
    "compress memory": /compress memory|optimize memory/i,
    "create head": /create head|new head/i,
    "context recap": /recap context|refresh context/i,
  };

  for (const [action, pattern] of Object.entries(actionPatterns)) {
    if (pattern.test(query)) actionItems.push(action);
  }

  query.split(/\s+/).forEach((word) => {
    if (word.length > 3) keywords.push(word);
  });

  if (actionItems.length > 0) {
    const taskCard = createTaskCard(query, actionItems);
    return { keywords, actionItems, taskCardId: taskCard.id };
  }

  return { keywords, actionItems, taskCardId: null };
};
