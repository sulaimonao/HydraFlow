import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/autonomous", async (req, res) => {
  try {
    const { query } = req.body;

    // Step 1: Parse query
    const parseResponse = await fetch("https://hydra-flow.vercel.app/api/parse-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const { actionItems } = await parseResponse.json();

    let results = {};

    // Step 2: Execute actions based on actionItems
    if (actionItems.includes("create-subpersona")) {
      const createResponse = await fetch("https://hydra-flow.vercel.app/api/create-subpersona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "speak like a Pokémon", description: "This sub-persona communicates like a Pokémon." }),
      });
      results.subPersona = await createResponse.json();
    }

    if (actionItems.includes("compress-memory")) {
      const compressResponse = await fetch("https://hydra-flow.vercel.app/api/compress-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memory: "A long conversation history." }),
      });
      results.compressedMemory = await compressResponse.json();
    }

    res.status(200).json({ message: "Workflow executed successfully", results });
  } catch (error) {
    console.error("Error in autonomous workflow:", error);
    res.status(500).json({ error: "Failed to execute workflow" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
