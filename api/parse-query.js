export default async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // Mock parsing logic
    const actionItems = [];
    if (query.includes("summarize logs")) actionItems.push("summarize-logs");
    if (query.includes("create a Pokémon persona")) actionItems.push("create-subpersona");

    res.status(200).json({
      keywords: query.split(" "), // Split the query into keywords for simplicity
      actionItems,
    });
  } catch (error) {
    console.error("Error in parse-query:", error);
    res.status(500).json({ error: "Failed to parse query." });
  }
};
