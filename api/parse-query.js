export default async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // Enhanced parsing logic
    const actionItems = [];
    const missingDetails = [];

    // Check for specific action keywords
    if (query.includes("summarize logs")) {
      actionItems.push("summarize-logs");
    } else if (query.includes("summarize")) {
      actionItems.push("summarize-logs");
      missingDetails.push("Specify which logs to summarize.");
    }

    if (query.includes("create a Pokémon persona")) {
      actionItems.push("create-subpersona");
    } else if (query.includes("create")) {
      actionItems.push("create-subpersona");
      missingDetails.push("Specify the type of persona to create.");
    }

    // Construct a Task Card for clearer objectives
    const taskCard = {
      goal: query,
      priority: "High", // Default for now, can be dynamically set later
      subtasks: actionItems.map((item) => ({ task: item, status: "pending" })),
    };

    // Return response based on parsed content
    if (missingDetails.length > 0) {
      return res.status(200).json({
        keywords: query.split(" "), // Split the query into keywords
        actionItems,
        missingDetails,
        taskCard,
        message: "Additional details are required to proceed.",
      });
    }

    res.status(200).json({
      keywords: query.split(" "),
      actionItems,
      taskCard,
      message: "Query parsed successfully.",
    });
  } catch (error) {
    console.error("Error in parse-query:", error);
    res.status(500).json({ error: "Failed to parse query." });
  }
};
