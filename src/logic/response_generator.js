// src/logic/response_generator.js
/**
 * Generates a final response string based on various inputs.
 *
 * @param {Object} params - The input parameters for the response.
 * @param {Object} params.contextDigest - Summary of the context, including memory entries and highlights.
 * @param {Object} params.taskCard - Task card details with subtasks.
 * @param {Object} params.actionsPerformed - Actions performed and their results.
 * @param {Object} params.feedbackPrompt - Feedback message and hint.
 * @param {Object} params.gaugeData - System awareness metrics like priority, memory usage, and active tasks.
 * @param {string} params.userInput - Original user query (optional).
 * @param {string} params.compressedMemory - Compressed memory string (optional).
 * @returns {string} - A formatted response string.
 */
export function generateFinalResponse({
  contextDigest,
  taskCard,
  actionsPerformed,
  feedbackPrompt,
  gaugeData,
  userInput,
  compressedMemory,
}) {
  const response = [];

  // Helper function to format lists
  const formatList = (items) =>
    items.map((item, index) => `  ${index + 1}. ${item}`).join("\n");

  // Show context digest
  if (contextDigest) {
    response.push(
      `### Context Digest:\n- Total Memory Entries: ${contextDigest.totalEntries}\n- Highlights:\n${formatList(
        contextDigest.highlights || []
      )}`
    );
  }

  // Show task card
  if (taskCard) {
    response.push(`### Task Card: ${taskCard.goal}`);
    taskCard.subtasks.forEach((subtask) => {
      response.push(`- **${subtask.task}**: ${subtask.status}`);
    });
  }

  // Show actions performed
  if (actionsPerformed) {
    response.push("### Actions Performed:");
    Object.entries(actionsPerformed).forEach(([key, value]) => {
      response.push(`- **${key}**: ${JSON.stringify(value, null, 2)}`);
    });
  }

  // Show feedback prompt
  if (feedbackPrompt) {
    response.push(`### Feedback Prompt:\n${feedbackPrompt.message}\nHint: ${feedbackPrompt.hint}`);
  }

  // Show gauge data
  if (gaugeData) {
    response.push("### System Awareness:");
    response.push(`- Priority: ${gaugeData.priority}`);
    response.push(`- Keywords: ${gaugeData.keywords.join(", ")}`);
    response.push(`- Memory Usage: ${gaugeData.memoryUsage}`);
    response.push(`- Heads Count: ${gaugeData.headCount}`);
    response.push(`- Active Tasks: ${gaugeData.activeTasksCount}`);
  }

  // Optional: Show user input or compressed memory
  if (userInput) {
    response.push(`### Original User Query:\n${userInput}`);
  }

  if (compressedMemory) {
    response.push(`### Compressed Memory:\n${compressedMemory}`);
  }

  // Combine into final string
  return response.join("\n\n");
}
