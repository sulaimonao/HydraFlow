// main.js 
import fetch from "node-fetch";
import dotenv from 'dotenv';
import { validate as validateUUID } from 'uuid';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || "https://hydra-flow.vercel.app/api" //'http://localhost:3000/api';
let sessionId = null; // 🔑 Session persistence variable

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

    const headers = {
      "Content-Type": "application/json",
    };

    // 🔑 Include session ID if it exists
    if (sessionId) {
      headers['X-Hydra-Session-ID'] = sessionId;
    }

    const response = await withRetry(() =>
      fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(enrichedPayload),
      })
    );

    if (!response.ok) {
      throw new Error(`Failed to call ${endpoint}: ${response.statusText}`);
    }

    // 🔄 Capture session ID from response header
    const newSessionId = response.headers.get('X-Hydra-Session-ID');
    if (newSessionId) {
      sessionId = newSessionId;
      console.log(`🔐 Session ID updated: ${sessionId}`);
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
        name: "Log Analyzer",
        capabilities: {},
        preferences: {},
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
        gaugeMetrics: {}
      }, user_id, chatroom_id);
    } catch (error) {
      console.error("❌ Error compressing memory:", error);
      return { error: error.message };
    }
  }
};

// Autonomous workflow trigger
async function runAutonomousWorkflow(query, user_id, chatroom_id) {
  try {
    if (!validateUUID(user_id) || !validateUUID(chatroom_id)) {
      throw new Error("Invalid session IDs for user or chatroom.");
    }

    // Initialize sessionId if not already set
    if (!sessionId) {
      sessionId = `${user_id}:${chatroom_id}`;
      console.log(`🔐 Initialized session ID: ${sessionId}`);
    }

    console.log(`🔎 Starting autonomous workflow: user_id=${user_id}, chatroom_id=${chatroom_id}`);

    const parseResponse = await callApi("/parse-query", { query }, user_id, chatroom_id);
    const { actionItems } = parseResponse;

    if (!actionItems || actionItems.length === 0) {
      console.log("ℹ️ No actionable items found.");
      return { message: "No actionable items found." };
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

    return { message: "Workflow executed successfully", results };
  } catch (error) {
    console.error("❌ Error in autonomous workflow:", error);
    return { error: error.message };
  }
}

export { runAutonomousWorkflow };
