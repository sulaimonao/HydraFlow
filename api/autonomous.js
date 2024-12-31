// api/autonomous.js
import { orchestrateContextWorkflow } from "../src/logic/workflow_manager.js";
import { fetchGaugeData } from "../util/db_helpers.js";
import { logInfo, logError } from "../util/logger.js";

export default async (req, res) => {
  try {
    const { query, memory, logs, feedback, user_id, chatroom_id } = req.body;

    if (!query || !user_id || !chatroom_id) {
      return res.status(400).json({
        error: "Query, user_id, and chatroom_id are required.",
      });
    }

    logInfo(`Starting autonomous workflow for user ${user_id} in chatroom ${chatroom_id}.`);

    const gaugeData = await fetchGaugeData({ userId: user_id, chatroomId: chatroom_id });
    logInfo(`Gauge data retrieved for user ${user_id} in chatroom ${chatroom_id}:`, gaugeData);

    if (!gaugeData) {
      return res.status(404).json({
        error: "Gauge data not found. Unable to proceed with autonomous workflow.",
      });
    }

    const result = await orchestrateContextWorkflow({
      query,
      memory,
      logs,
      feedback,
      user_id,
      chatroom_id,
      tokenCount: gaugeData.tokenCount,
      priority: gaugeData.priority,
      activeTasks: gaugeData.activeTasksCount,
    });

    logInfo(`Autonomous workflow completed for user ${user_id} in chatroom ${chatroom_id}.`);

    res.status(200).json({
      message: "Autonomous workflow executed successfully.",
      gaugeData,
      ...result,
    });
  } catch (error) {
    logError(`Error in autonomous workflow: ${error.message}`);
    res.status(500).json({ error: error.message || "Failed to execute autonomous workflow." });
  }
};
