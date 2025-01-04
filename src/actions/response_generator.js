export const generateFinalResponse = ({ contextDigest, taskCard, actionsPerformed }) => {
    const response = [];
  
    // Include context digest summary
    if (contextDigest) {
      response.push(
        `### Context Digest:\n- Total Memory Entries: ${contextDigest.totalEntries}\n- Highlights:\n${contextDigest.highlights
          .map((entry, index) => `  ${index + 1}. ${entry}`)
          .join("\n")}`
      );
    }
  
    // Include task statuses
    if (taskCard) {
      response.push(`### Task Card: ${taskCard.goal}`);
      taskCard.subtasks.forEach((subtask) => {
        response.push(`- **${subtask.task}**: ${subtask.status}`);
      });
    }
  
    // Include results of actions performed
    if (actionsPerformed) {
      response.push("### Actions Performed:");
      Object.keys(actionsPerformed).forEach((key) => {
        response.push(`- **${key}**: ${JSON.stringify(actionsPerformed[key], null, 2)}`);
      });
    }
  
    // Combine response into a cohesive output
    return response.join("\n\n");
  };

async function generateResponse(input, context) {
  // Mock response generation logic
  const response = `Processed input: ${input}`;
  context.tokenUsage = context.tokenUsage || { used: 500, total: 8192 }; // Example token usage
  context.responseLatency = 0.7; // Example latency
  return response;
}

module.exports = {
  generateResponse,
};