//src/actions/rresponse_generator_actions.js
import { calculateMetrics } from "../util/metrics.js";

/**
 * Generates a detailed and formatted response based on the context, task status, and actions performed.
 * @param {Object} params - Contextual data for response generation.
 * @param {Object} params.contextDigest - Summary of memory and highlights.
 * @param {Object} params.taskCard - Current task and subtasks with statuses.
 * @param {Object} params.actionsPerformed - Results of executed actions.
 * @param {Object} [params.gaugeMetrics] - Optional system performance metrics.
 * @returns {string} - Structured final response.
 */
export const generateFinalResponse = ({ contextDigest, taskCard, actionsPerformed, gaugeMetrics }) => {
  const response = [];

  // === 🧠 Context Digest Summary ===
  if (contextDigest) {
    response.push(
      `### 🧠 Context Digest:\n- **Total Memory Entries:** ${contextDigest.totalEntries}\n- **Highlights:**\n${contextDigest.highlights
        .map((entry, index) => `  ${index + 1}. ${entry}`)
        .join("\n")}`
    );
  }

  // === 📋 Task Card Overview ===
  if (taskCard) {
    response.push(`### 📋 Task Card: **${taskCard.goal}**`);
    taskCard.subtasks.forEach((subtask) => {
      const statusIcon = subtask.status === "completed" ? "✅" : subtask.status === "in-progress" ? "⏳" : "❌";
      response.push(`- **${subtask.task}** → *${statusIcon} ${subtask.status}*`);
    });
  }

  // === ⚙️ Actions Performed ===
  if (actionsPerformed && Object.keys(actionsPerformed).length > 0) {
    response.push("### ⚙️ Actions Performed:");
    Object.entries(actionsPerformed).forEach(([action, result]) => {
      const formattedResult = typeof result === "object" ? JSON.stringify(result, null, 2) : result;
      response.push(`- **${action}**:\n${formattedResult}`);
    });
  } else {
    response.push("### ⚙️ Actions Performed:\n- No actions were executed in this workflow.");
  }

  // === 📊 Gauge Metrics Overview ===
  if (gaugeMetrics) {
    response.push(`### 📊 Gauge Metrics:\n- **Token Usage:** ${gaugeMetrics.tokenUsage.used} / ${gaugeMetrics.tokenUsage.total}\n- **Latency:** ${gaugeMetrics.responseLatency}s\n- **Active Subpersonas:** ${gaugeMetrics.activeSubpersonas.length}`);
  }

  return response.join("\n\n");
};

/**
 * Generates a basic response based on user input and workflow context.
 * @param {string} input - The user's query or instruction.
 * @param {Object} context - Current state and data context.
 * @returns {Object} - Response with feedback and gauge metrics.
 */
export async function generateResponse(input, context) {
  try {
    if (!input || typeof input !== "string" || input.trim() === "") {
      throw new Error("❌ Invalid input provided to generateResponse. Input must be a non-empty string.");
    }

    // 🔎 Basic input processing
    const responseText = `🔍 **Processed Input:** ${input.trim()}`;

    // 📊 Calculate and attach system metrics
    const gaugeMetrics = calculateMetrics(context);

    return {
      status: "success",
      response: responseText,
      gauge: gaugeMetrics, // Include system metrics
    };
  } catch (error) {
    console.error("❌ Error generating response:", error.message);
    return {
      status: "error",
      message: "Failed to generate a response. Please check your input.",
      details: error.message,
    };
  }
}
