// main.js

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

// Helper function for API calls
async function callApi(endpoint, payload = {}, method = "POST") {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify(payload) : null,
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(
        `Failed to call ${endpoint}: ${response.status} ${response.statusText} - ${errorDetail}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

// Action handlers for each actionItem
const actionHandlers = {
  "create-subpersona": async (details) => {
    return await callApi("/create-subpersona", {
      task: details.task || "default task",
      description: details.description || "Default sub-persona description",
    });
  },
  "compress-memory": async (details) => {
    const memory = details.memory || "Default memory chunk.";
    return await callApi("/compress-memory", { memory });
  },
  "summarize-logs": async (details) => {
    return await callApi("/summarize-logs", {
      logs: details.logs || "Default log content.",
    });
  },
  "context-recap": async (details) => {
    return await callApi("/utils?action=recap", {
      history: details.history || [],
      compressedMemory: details.compressedMemory || "Default compressed memory.",
    });
  },
  "gauge-data": async (details) => {
    return await callApi(`/gauge?user_id=${details.user_id}&chatroom_id=${details.chatroom_id}`, {}, "GET");
  },
  // Add new action handlers here as needed
};

app.post("/api/autonomous", async (req, res) => {
  try {
    const { query, details } = req.body;

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
        results[action] = await actionHandlers[action](details || {});
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

