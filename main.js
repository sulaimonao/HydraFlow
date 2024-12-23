//main.js

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const API_BASE_URL = "https://hydra-flow.vercel.app/api";

// Helper function for API calls
async function callApi(endpoint, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to call ${endpoint}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

// Action handlers for each actionItem
const actionHandlers = {
  "create-subpersona": async () => {
    return await callApi("/create-subpersona", {
      task: "speak like a Pokémon",
      description: "This sub-persona communicates like a Pokémon.",
    });
  },
  "compress-memory": async () => {
    return await callApi("/compress-memory", {
      memory: "A long conversation history.",
    });
  },
  // Add new action handlers here as needed
};

app.post("/api/autonomous", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // Step 1: Parse query
    const parseResponse = await callApi("/parse-query", { query });
    const { actionItems } = parseResponse;

    let results = {};

    // Step 2: Execute actions dynamically
    for (const action of actionItems) {
      if (actionHandlers[action]) {
        results[action] = await actionHandlers[action]();
      } else {
        console.warn(`Unknown action: ${action}`);
      }
    }

    res.status(200).json({ message: "Workflow executed successfully", results });
  } catch (error) {
    console.error("Error in autonomous workflow:", error);
    res.status(500).json({ error: "Failed to execute workflow." });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
