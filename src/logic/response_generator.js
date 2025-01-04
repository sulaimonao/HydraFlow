// Updated response_generator.js
export async function generateFinalResponse({ userInput, compressedMemory, summaryReport, context, taskCard, actionsPerformed }) {
  let draftResponse = "Here's my response:\n\n";

  if (summaryReport) {
    draftResponse += `Summary Report:\n${summaryReport}\n\n`;
  }

  if (compressedMemory) {
    draftResponse += `Context (Compressed):\n${compressedMemory}\n\n`;
  }

  if (taskCard) {
    draftResponse += `Tasks Executed:\n${taskCard.subtasks.map(task => `- ${task.task}: ${task.status}`).join('\n')}\n\n`;
  }

  if (actionsPerformed) {
    draftResponse += `Actions Performed:\n${Object.entries(actionsPerformed).map(([action, result]) => `- ${action}: ${result}`).join('\n')}\n\n`;
  }

  draftResponse += `User asked: "${userInput}"\nDomain: ${context.domain}\nGoal: ${context.project_goal}`;

  return draftResponse;
}