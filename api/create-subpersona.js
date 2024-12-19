export default async (req, res) => {
  try {
    const { task, description, parentHeadId } = req.body;

    if (!task || !description) {
      return res.status(400).json({ error: "Task and description are required." });
    }

    // Generate a dynamic name for the sub-persona
    const timestamp = Date.now();
    const subPersonaName = `${task.replace(/ /g, "").toLowerCase()}_${timestamp}`;
    const subPersonaData = {
      name: subPersonaName,
      taskDescription: description,
      parentHeadId: parentHeadId || null, // Link to parent persona if provided
      status: "active",
      createdAt: new Date(timestamp).toISOString(),
    };

    // Mock saving the sub-persona (you can replace this with actual database logic)
    console.log("Sub-Persona Created:", subPersonaData);

    // Respond with the new sub-persona details
    res.status(200).json(subPersonaData);
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: "Failed to create sub-persona." });
  }
};
