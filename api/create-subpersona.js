// create-subpersona.js

export default async (req, res) => {
  try {
    const { task, description } = req.body;

    // Input validation
    if (!task || !description) {
      return res.status(400).json({ error: "Task and description are required." });
    }

    // Generate unique sub-persona metadata
    const timestamp = Date.now();
    const subPersonaName = `${task.replace(/ /g, "").toLowerCase()}_${timestamp}`;
    const subPersonaData = {
      name: subPersonaName,
      taskDescription: description,
      status: "active",
      createdAt: new Date(timestamp).toISOString(),
    };

    // Log creation (or replace with database logic)
    console.log("Sub-Persona Created:", subPersonaData);

    // Return sub-persona details
    return res.status(200).json({
      subPersonaName: subPersonaData.name,
      description: subPersonaData.taskDescription,
      status: subPersonaData.status,
      createdAt: subPersonaData.createdAt,
      metadata: {
        taskId: timestamp,
      },
      message: "Sub-persona created successfully.",
    });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    return res.status(500).json({ error: "Failed to create sub-persona. Please try again." });
  }
};
