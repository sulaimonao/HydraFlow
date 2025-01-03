// api/create-subpersona.js
import { addHead, fetchExistingHead, logInfo, logError, fetchGaugeData } from "../src/util/index.js";
import { fetchTemplate } from "../src/state/index.js";
import { ERRORS } from "../src/util/constants.js"; // Import constants

export default async (req, res) => {
  try {
    const { task, description, user_id, chatroom_id } = req.body;

    if (!task || !description || !user_id || !chatroom_id) {
      return res.status(400).json({
        error: "Task, description, user_id, and chatroom_id are required.",
      });
    }

    const existingHead = await fetchExistingHead(task, user_id, chatroom_id);
    if (existingHead) {
      return res.status(409).json({ error: "Duplicate head entry detected." });
    }

    const template = await fetchTemplate(task);
    let templateDetails = null;

    if (template) {
      templateDetails = {
        capabilities: template.capabilities,
        preferences: template.preferences,
      };
      logInfo(`Template fetched for task "${task}":`, templateDetails);
    }

    const newHead = await addHead(
      task,
      description,
      user_id,
      chatroom_id,
      templateDetails
    );

    const gaugeData = await fetchGaugeData({ userId: user_id, chatroomId: chatroom_id });
    logInfo(`Gauge data fetched for user ${user_id} in chatroom ${chatroom_id}:`, gaugeData);

    return res.status(201).json({
      subPersonaName: newHead.name,
      description: newHead.taskDescription,
      status: newHead.status,
      createdAt: newHead.createdAt,
      templateUsed: template ? template.name : null,
      gauge: gaugeData,
      message: "Sub-persona created successfully.",
    });
  } catch (error) {
    logError("Error in create-subpersona:", error);
    return res.status(500).json({ error: ERRORS.GENERIC }); // Use constant for error message
  }
};
