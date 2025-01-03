// main.js
import express from "express";
import fetch from "node-fetch";
import { createLogger, format, transports } from "winston";
import Joi from "joi";

const app = express();
app.use(express.json());

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

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
    logger.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

// Action handlers for each actionItem
const actionHandlers = {
  "create-subpersona": async (details) =>
    callApi("/create-subpersona", {
      task: details.task || "default task",
      description: details.description || "Default sub-persona description",
      user_id: details.user_id,
      chatroom_id: details.chatroom_id,
    }),
  "compress-memory": async (details) =>
    callApi("/compress-memory", { memory: details.memory }),
  "summarize-logs": async (details) =>
    callApi("/summarize-logs", { logs: details.logs }),
  "context-recap": async (details) =>
    callApi("/utils?action=recap", {
      history: details.history || [],
      compressedMemory: details.compressedMemory || "",
    }),
  "gauge-data": async (details) =>
    callApi(`/gauge?user_id=${details.user_id}&chatroom_id=${details.chatroom_id}`, {}, "GET"),
};

// Input validation schema
const workflowSchema = Joi.object({
  query: Joi.string().required(),
  details: Joi.object({
    user_id: Joi.string().required(),
    chatroom_id: Joi.string().required(),
    task: Joi.string().optional(),
    description: Joi.string().optional(),
    memory: Joi.string().optional(),
    logs: Joi.string().optional(),
    history: Joi.array().items(Joi.string()).optional(),
    compressedMemory: Joi.string().optional(),
  }).required(),
});

app.post("/api/autonomous", async (req, res) => {
  try {
    const { error, value } = workflowSchema.validate(req.body);
    if (error) {
      logger.error("Validation error:", error.details);
      return res.status(400).json({ error: error.message });
    }

    const { query, details } = value;

    // Step 1: Parse query
    const parseResponse = await callApi("/parse-query", { query });
    const { actionItems } = parseResponse;

    const results = {};

    // Step 2: Execute actions dynamically
    for (const action of actionItems) {
      if (actionHandlers[action]) {
        results[action] = await actionHandlers[action](details);
      } else {
        logger.warn(`Unknown action: ${action}`);
      }
    }

    res.status(200).json({ message: "Workflow executed successfully", results });
  } catch (error) {
    logger.error("Error in autonomous workflow:", error);
    res.status(500).json({ error: "Failed to execute workflow." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
