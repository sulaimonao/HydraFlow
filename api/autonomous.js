// api/autonomous.js
import { orchestrateContextWorkflow } from "../src/logic/workflow_manager.js";
import { fetchGaugeData, logInfo, logError } from "../src/util/gauge.js";

export default async (req, res) => {
  try {
    const { query, memory, logs, feedback, user_id, chatroom_id } = req.body;

    if (!query || !user_id || !chatroom_id) {
      return res.status(400).json({
        error: "Missing required fields: query, user_id, or chatroom_id.",
      });
    }

    logInfo(`Starting autonomous workflow for user ${user_id} in chatroom ${chatroom_id}.`);

    const gaugeData = await fetchGaugeData({ userId: user_id, chatroomId: chatroom_id });
    if (!gaugeData) {
      return res.status(404).json({ error: "Gauge data not found." });
    }

    const result = await orchestrateContextWorkflow({
      query,
      memory,
      logs,
      feedback,
      user_id,
      chatroom_id,
      tokenCount: gaugeData.tokenCount || 0,
      priority: gaugeData.priority || "Normal",
      activeTasks: gaugeData.activeTasksCount || 0,
    });

    logInfo(`Autonomous workflow completed successfully.`);
    res.status(200).json({ message: "Success", result });
  } catch (error) {
    logError(`Error in autonomous workflow: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};
