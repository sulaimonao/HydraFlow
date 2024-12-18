export default async (req, res) => {
  try {
    const { task, description } = req.body;

    if (!task || !description) {
      return res.status(400).json({ error: "Task and description are required." });
    }

    // Mock response for now
    const subPersonaName = task.replace(/ /g, "").toLowerCase();
    const result = { subPersonaName, status: "active" };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: "Failed to create sub-persona." });
  }
};
