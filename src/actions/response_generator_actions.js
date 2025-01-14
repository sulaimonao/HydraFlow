//src/actions/response_generator.js
import { calculateMetrics } from "../util/metrics.js";

/**
 * Generates a detailed and formatted response based on the context, task status, and actions performed.
 * @param {Object} params - Contextual data for response generation.
 * @param {Object} params.contextDigest - Summary of memory and highlights.
 * @param {Object} params.taskCard - Current task and subtasks with statuses.
 * @param {Object} params.actionsPerformed - Results of executed actions.
 * @returns {string} - Structured final response.
 */
export const generateFinalResponse = ({ contextDigest, taskCard, actionsPerformed }) => {
  const response = [];

  // === 📂 Context Digest Summary ===
  if (contextDigest) {
    response.push(
      `### 🧠 Context Digest:\n- **Total Memory Entries:** ${contextDigest.totalEntries}\n- **Highlights:**\n${contextDigest.highlights
        .map((entry, index) => `  ${index + 1}. ${entry}`)
        .join("\n")}`
    );
  }

  // === ✅ Task Card Overview ===
  if (taskCard) {
    response.push(`### 📋 Task Card: **${taskCard.goal}**`);
    taskCard.subtasks.forEach((subtask) => {
      response.push(`- **${subtask.task}** → *${subtask.status}*`);
    });
  }

  // === ⚡ Actions Performed ===
  if (actionsPerformed && Object.keys(actionsPerformed).length > 0) {
    response.push("### ⚙️ Actions Performed:");
    Object.entries(actionsPerformed).forEach(([action, result]) => {
      const formattedResult = typeof result === "object" ? JSON.stringify(result, null, 2) : result;
      response.push(`- **${action}**:\n${formattedResult}`);
    });
  } else {
    response.push("### ⚙️ Actions Performed:\n- No actions were executed in this workflow.");
  }

  return response.join("\n\n");
};

/**
 * Generates a response based on user input and workflow context.
 * @param {string} input - The user's query or instruction.
 * @param {Object} context - Current state and data context.
 * @returns {Object} - Response with feedback and gauge metrics.
 */
export async function generateResponse(input, context) {
  if (!input || typeof input !== "string") {
    throw new Error("Invalid input provided to generateResponse.");
  }

  // 📝 Basic input processing
  const response = `🔍 **Processed Input:** ${input}`;

  // 📊 Attach calculated gauge metrics to the response
  const gaugeMetrics = calculateMetrics(context);

  return {
    response,
    gauge: gaugeMetrics, // Include system metrics
  };
}
