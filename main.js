// main.js

import express from "express";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { createSession, setSessionContext } from './lib/supabaseClient.js';

dotenv.config();

const app = express();
app.use(express.json());

const API_BASE_URL = process.env.API_BASE_URL;

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
      task: "analyze logs",
      description: "This sub-persona specializes in log analysis.",
      triggerCondition: "new log uploaded",
    });
  },
  "compress-memory": async () => {
    return await callApi("/compress-memory", {
      memory: "A long conversation history.",
    });
  },
  "summarize-logs": async () => {
    return await callApi("/summarize-logs", {
      logs: "Error and access logs from the server.",
    });
  },
};

app.post("/api/autonomous", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // 🚀 Step 1: Initialize session with unique user_id and chatroom_id
    const user_id = uuidv4();
    const chatroom_id = uuidv4();

    console.log(`🔎 Initializing session: user_id=${user_id}, chatroom_id=${chatroom_id}`);

    await createSession(user_id, chatroom_id);
    await setSessionContext(user_id, chatroom_id);

    console.log("✅ Session initialized successfully.");

    // Step 2: Parse query
    const parseResponse = await callApi("/parse-query", { query });
    const { actionItems } = parseResponse;

    let results = {};

    // Step 3: Execute actions dynamically
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

export default app;
