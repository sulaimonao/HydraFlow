// api/create-subpersona.js
import { addHead, fetchExistingHead, logInfo, logError, fetchGaugeData } from "../src/util/heads.js";
import { fetchTemplate } from "../src/state/templates_state.js";
import { ERRORS } from "../src/util/constants.js";

export default async (req, res) => {
  try {
    const { task, description, user_id, chatroom_id } = req.body;

    if (!task || !description || !user_id || !chatroom_id) {
      logError("Invalid request: Missing required fields.");
      return res.status(400).json({ error: "Task, description, user_id, and chatroom_id are required." });
    }

    logInfo(`Checking for existing sub-persona for task "${task}" in chatroom ${chatroom_id}.`);
    const existingHead = await fetchExistingHead(task, user_id, chatroom_id);
    if (existingHead) {
      logError("Duplicate sub-persona entry detected.");
      return res.status(409).json({ error: "Duplicate sub-persona entry detected." });
    }

    const template = await fetchTemplate(task);
    const templateDetails = template ? { capabilities: template.capabilities, preferences: template.preferences } : null;

    logInfo(`Creating new sub-persona for user ${user_id} in chatroom ${chatroom_id}.`);
    const newHead = await addHead(task, description, user_id, chatroom_id, templateDetails);

    const gaugeData = await fetchGaugeData({ userId: user_id, chatroomId: chatroom_id });
    logInfo(`Gauge data fetched successfully for user ${user_id}.`);

    return res.status(201).json({
      subPersonaName: newHead.task,
      description: newHead.description,
      templateUsed: template ? template.name : "No template used",
      gauge: gaugeData,
      message: "Sub-persona created successfully.",
    });
  } catch (error) {
    logError(`Error in create-subpersona: ${error.message}`);
    return res.status(500).json({ error: ERRORS.GENERIC });
  }
};
