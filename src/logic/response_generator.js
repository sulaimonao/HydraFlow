// src/logic/response_generator.js

import { generateFinalResponse } from './db_helpers.js';
  contextDigest,
  taskCard,
  actionsPerformed,
  feedbackPrompt,
  gaugeData,       // Newly added field
  userInput,       // Display original user input
  compressedMemory // Display compressed memory if applicable
}) => {
  const response = [];

  // (Existing) Show context digest
  if (contextDigest) {
    response.push(
      `### Context Digest:\n- Total Memory Entries: ${contextDigest.totalEntries}\n- Highlights:\n${contextDigest.highlights
        .map((entry, index) => `  ${index + 1}. ${entry}`)
        .join("\n")}`
    );
  }

  // (Existing) Show task card
  if (taskCard) {
    response.push(`### Task Card: ${taskCard.goal}`);
    taskCard.subtasks.forEach((subtask) => {
      response.push(`- **${subtask.task}**: ${subtask.status}`);
    });
  }

  // (Existing) Show results of actions performed
  if (actionsPerformed) {
    response.push("### Actions Performed:");
    Object.keys(actionsPerformed).forEach((key) => {
      response.push(`- **${key}**: ${JSON.stringify(actionsPerformed[key], null, 2)}`);
    });
  }

  // (Existing) Show feedback prompt
  if (feedbackPrompt) {
    response.push(`### Feedback Prompt:\n${feedbackPrompt.message}\nHint: ${feedbackPrompt.hint}`);
  }

  // (NEW) Show gauge data block if present
  if (gaugeData) {
    response.push("### System Awareness:");
    response.push(`- Priority: ${gaugeData.priority}`);
    response.push(`- Keywords: ${gaugeData.keywords.join(", ")}`);
    response.push(`- Memory Usage: ${gaugeData.memoryUsage}`);
    response.push(`- Heads Count: ${gaugeData.headCount}`);
    response.push(`- Active Tasks: ${gaugeData.activeTasksCount}`);
  }

  // (Optional) Display userInput or compressedMemory if you want
  if (userInput) {
    response.push(`### Original User Query:\n${userInput}`);
  }

  if (compressedMemory) {
    response.push(`### Compressed Memory:\n${compressedMemory}`);
  }

  // Combine into final string
  return response.join("\n\n");
};
