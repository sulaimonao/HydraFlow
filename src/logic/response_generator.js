// src/logic/response_generator.js
/**
 * 📢 Generates a structured and detailed final response for the user.
 * @param {Object} params - Data required for generating the response.
 * @param {string} params.userInput - User's input or query.
 * @param {string} [params.compressedMemory] - Compressed memory snapshot (optional).
 * @param {string} [params.summaryReport] - Generated summary report (optional).
 * @param {Object} params.context - Current workflow context (must include domain and project goal).
 * @param {Object} [params.taskCard] - Task card with subtasks (optional).
 * @param {Object} [params.actionsPerformed] - Actions executed with results (optional).
 * @returns {string} - A well-structured response for the user.
 */
export async function generateFinalResponse({
  userInput,
  compressedMemory,
  summaryReport,
  context,
  taskCard,
  actionsPerformed
}) {
  // 🔍 Validate essential inputs
  if (!userInput || !context || !context.domain || !context.project_goal) {
    throw new Error("❗ Missing required fields: 'userInput' or 'context' (with 'domain' and 'project_goal').");
  }

  let draftResponse = `### 💬 Assistant Response\n\n`;

  // 📝 Include Summary Report
  if (summaryReport) {
    draftResponse += `**📝 Summary Report:**\n${summaryReport}\n\n`;
  }

  // 🧠 Include Compressed Memory Context
  if (compressedMemory) {
    draftResponse += `**🧠 Context (Compressed):**\n${compressedMemory}\n\n`;
  }

  // 📋 Include Task Card Execution Details
  if (taskCard && taskCard.subtasks && Array.isArray(taskCard.subtasks)) {
    draftResponse += `**📋 Tasks Executed:**\n${taskCard.subtasks
      .map((task) => `- ${task.task}: *${task.status}*`)
      .join('\n')}\n\n`;
  }

  // ⚙️ Include Actions Performed
  if (actionsPerformed && typeof actionsPerformed === 'object') {
    draftResponse += `**⚡ Actions Performed:**\n${Object.entries(actionsPerformed)
      .map(([action, result]) => `- **${action}:** ${result}`)
      .join('\n')}\n\n`;
  }

  // ❓ Include User Query and Context
  draftResponse += `**❓ User Query:** "${userInput}"\n`;
  draftResponse += `**🌐 Domain:** ${context.domain}\n`;
  draftResponse += `**🎯 Project Goal:** ${context.project_goal}\n`;

  return draftResponse;
}
