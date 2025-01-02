// api/create-subpersona.js
import { addHead, fetchExistingHead } from "../src/util"; // Import addHead and fetchExistingHead functions
import { fetchTemplate } from "../src/state"; // Import fetchTemplate function

export default async (req, res) => {
  try {
    const { task, description, user_id, chatroom_id } = req.body;

    if (!task || !description || !user_id || !chatroom_id) {
      return res.status(400).json({
        error: "Task, description, user_id, and chatroom_id are required.",
      });
    }

    // Check for duplicate heads
    const existingHead = await fetchExistingHead(task, user_id, chatroom_id);
    if (existingHead) {
      return res.status(409).json({ error: "Duplicate head entry detected." });
    }

    // Fetch template based on the task
    const template = await fetchTemplate(task);
    let templateDetails = null;

    if (template) {
      templateDetails = {
        capabilities: template.capabilities,
        preferences: template.preferences,
      };
      console.log(`Template fetched for task "${task}":`, templateDetails);
    }

    // Create the new sub-persona, incorporating template details if available
    const newHead = await addHead(
      task,
      description,
      user_id,
      chatroom_id,
      templateDetails // Pass template details to addHead
    );

    // Update gauge after creating the sub-persona
    const gaugeData = await fetchGaugeData({ userId: user_id, chatroomId: chatroom_id });
    console.log(`Gauge data fetched for user ${user_id} in chatroom ${chatroom_id}:`, gaugeData);

    return res.status(201).json({
      subPersonaName: newHead.name,
      description: newHead.taskDescription,
      status: newHead.status,
      createdAt: newHead.createdAt,
      templateUsed: template ? template.name : null, // Include template name if used
      gauge: gaugeData,
      message: "Sub-persona created successfully.",
    });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    return res.status(500).json({ error: "Failed to create sub-persona. Please try again." });
  }
};
