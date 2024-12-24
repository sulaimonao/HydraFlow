// create-subpersona.js

export default async (req, res) => {
  try {
    const { task, description } = req.body;

    // Validate input
    if (!task || !description) {
      return res.status(400).json({ error: "Task and description are required." });
    }

    // Generate a unique sub-persona name
    const timestamp = Date.now();
    const subPersonaName = `${task.replace(/ /g, "").toLowerCase()}_${timestamp}`;
    const subPersonaData = {
      name: subPersonaName,
      taskDescription: description,
      status: "active",
      createdAt: new Date(timestamp).toISOString(),
    };

    // Replace this with database save logic if needed
    console.log("Sub-Persona Created:", subPersonaData);

    // Return the new sub-persona details
    res.status(200).json({
      subPersonaName: subPersonaData.name,
      description: subPersonaData.taskDescription,
      status: subPersonaData.status,
      createdAt: subPersonaData.createdAt,
    });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: "Failed to create sub-persona." });
  }
};
