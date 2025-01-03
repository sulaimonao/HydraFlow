// src/logic/response_generator.js
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

  const formatList = (items) =>
    items.map((item, index) => `  ${index + 1}. ${item}`).join("\n");

  if (contextDigest) {
    response.push(
      `### Context Digest:\n- Total Memory Entries: ${contextDigest.totalEntries}\n- Highlights:\n${formatList(
        contextDigest.highlights || []
      )}`
    );
  }

  if (taskCard) {
    response.push(`### Task Card: ${taskCard.goal}`);
    taskCard.subtasks.forEach((subtask) => {
      response.push(`- **${subtask.task}**: ${subtask.status}`);
    });
  }

  if (actionsPerformed) {
    response.push("### Actions Performed:");
    Object.entries(actionsPerformed).forEach(([key, value]) => {
      response.push(`- **${key}**: ${JSON.stringify(value, null, 2)}`);
    });
  }

  if (feedbackPrompt) {
    response.push(`### Feedback Prompt:\n${feedbackPrompt.message}\nHint: ${feedbackPrompt.hint}`);
  }

  if (gaugeData) {
    response.push("### System Awareness:");
    response.push(`- Priority: ${gaugeData.priority}`);
    response.push(`- Memory Usage: ${gaugeData.memoryUsage}`);
    response.push(`- Heads Count: ${gaugeData.headCount}`);
  }

  if (userInput) {
    response.push(`### Original User Query:\n${userInput}`);
  }

  if (compressedMemory) {
    response.push(`### Compressed Memory:\n${compressedMemory}`);
  }

  return response.join("\n\n");
}
