// main.js
import express from "express";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import { createSession, setSessionContext } from './lib/supabaseClient.js';
import { validate as validateUUID } from 'uuid';

dotenv.config();

const app = express();
app.use(express.json());

const API_BASE_URL = process.env.API_BASE_URL;
const PORT = process.env.PORT || 3000;

// 🔄 Retry mechanism for API calls
async function withRetry(task, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await task();
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) throw error;
    }
  }
}

// Helper function for API calls with user context
async function callApi(endpoint, payload, user_id, chatroom_id) {
  try {
    const enrichedPayload = {
      ...payload,
      user_id,
      chatroom_id,
    };

    const response = await withRetry(() =>
      fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrichedPayload),
      })
    );

    if (!response.ok) {
      throw new Error(`Failed to call ${endpoint}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error);
    throw error;
  }
}

// Action handlers with persistent user and chatroom context
const actionHandlers = {
  "create-subpersona": async (user_id, chatroom_id) => {
    try {
      return await callApi("/create-subpersona", {
        task: "analyze logs",
        description: "This sub-persona specializes in log analysis.",
        triggerCondition: "new log uploaded",
      }, user_id, chatroom_id);
    } catch (error) {
      console.error("❌ Error creating subpersona:", error);
      return { error: error.message };
    }
  },
  "compress-memory": async (user_id, chatroom_id) => {
    try {
      return await callApi("/compress-memory", {
        memory: "A long conversation history.",
      }, user_id, chatroom_id);
    } catch (error) {
      console.error("❌ Error compressing memory:", error);
      return { error: error.message };
    }
  },
  "summarize-logs": async (user_id, chatroom_id) => {
    try {
      return await callApi("/summarize-logs", {
        logs: "Error and access logs from the server.",
      }, user_id, chatroom_id);
    } catch (error) {
      console.error("❌ Error summarizing logs:", error);
      return { error: error.message };
    }
  },
};

app.post("/api/autonomous", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    const user_id = req.userId;
    const chatroom_id = req.chatroomId;

    if (!validateUUID(user_id) || !validateUUID(chatroom_id)) {
      throw new Error("Invalid session IDs for user or chatroom.");
    }

    console.log(`🔎 Initializing session: user_id=${user_id}, chatroom_id=${chatroom_id}`);

    await createSession(user_id, chatroom_id);
    await setSessionContext(user_id, chatroom_id);

    console.log("✅ Session initialized successfully.");

    const parseResponse = await callApi("/parse-query", { query }, user_id, chatroom_id);
    const { actionItems } = parseResponse;

    if (!actionItems || actionItems.length === 0) {
      return res.status(200).json({ message: "No actionable items found in the query." });
    }

    let results = {};

    for (const action of actionItems) {
      if (actionHandlers[action]) {
        console.log(`🔄 Executing action: ${action}`);
        results[action] = await actionHandlers[action](user_id, chatroom_id);
      } else {
        console.warn(`⚠️ Unknown action: ${action}`);
        results[action] = { error: `No handler for action: ${action}` };
      }
    }

    res.status(200).json({ message: "Workflow executed successfully", results });
  } catch (error) {
    console.error("❌ Error in autonomous workflow:", error);
    res.status(500).json({ error: "Failed to execute workflow.", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
