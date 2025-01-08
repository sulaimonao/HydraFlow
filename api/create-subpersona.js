// api/create-subpersona.js

export default async (req, res) => {
  try {
    const { task, description, triggerCondition } = req.body;

    // Input validation
    if (!task || !description) {
      return res.status(400).json({ error: "Task and description are required." });
    }

    if (triggerCondition && typeof triggerCondition !== "string") {
      return res.status(400).json({ error: "Trigger condition must be a string if provided." });
    }

    // Generate unique sub-persona metadata
    const timestamp = Date.now();
    const subPersonaName = `${task.replace(/ /g, "").toLowerCase()}_${timestamp}`;
    const subPersonaData = {
      name: subPersonaName,
      taskDescription: description,
      status: "active",
      createdAt: new Date(timestamp).toISOString(),
      triggerCondition: triggerCondition || "none",
    };

    // Log creation (or replace with database logic)
    console.log("Sub-Persona Created:", subPersonaData);

    // Return sub-persona details with gauge metrics
    return res.status(200).json({
      subPersonaName: subPersonaData.name,
      description: subPersonaData.taskDescription,
      status: subPersonaData.status,
      createdAt: subPersonaData.createdAt,
      triggerCondition: subPersonaData.triggerCondition,
      metadata: {
        taskId: timestamp,
      },
      gaugeMetrics: res.locals.gaugeMetrics,
      message: "Sub-persona created successfully.",
    });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    return res.status(500).json({ error: "Failed to create sub-persona. Please try again." });
  }
};
