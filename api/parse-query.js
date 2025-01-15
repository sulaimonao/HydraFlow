// api/parse-query.js

import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { fetchTaskCards } from '../lib/db.js';

export default async (req, res) => {
  try {
    const { query } = req.body;

    // Input validation
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "A valid query string is required." });
    }

    // Fetch related data from the database
    const existingTaskCards = await fetchTaskCards();

    // Initialize tasks and details
    const actionItems = [];
    const extractedDetails = {};

    // Predictive parsing and task identification
    if (/summarize.*logs/i.test(query)) {
      actionItems.push("summarize-logs");
      extractedDetails["summarize-logs"] = "Summarize the provided logs for key patterns and errors.";
    }

    if (/create.*persona/i.test(query)) {
      actionItems.push("create-subpersona");
      const personaDescriptionMatch = query.match(/create.*persona.*(?:like|inspired by)?\s(.*)/i);
      extractedDetails["create-subpersona"] =
        personaDescriptionMatch?.[1] || "Generic persona for dynamic user interaction.";
    }

    if (/optimize.*memory/i.test(query)) {
      actionItems.push("compress-memory");
      extractedDetails["compress-memory"] = "Compress and optimize memory for efficient usage.";
    }

    // Construct a structured task card
    const taskCard = {
      goal: query,
      priority: "High", // Default priority for tasks
      subtasks: actionItems.map((item) => ({
        task: item,
        status: "pending",
        description: extractedDetails[item] || "No additional details provided.",
      })),
    };

    // Predictive analysis and workflow orchestration
    const workflowPlan = await orchestrateContextWorkflow({
      query,
      req,
      existingTasks: existingTaskCards,
      proposedTasks: taskCard.subtasks,
    });

    const persistentUserId = workflowPlan.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowPlan.generatedIdentifiers.chatroom_id;

    // Respond with structured data and gauge metrics
    res.status(200).json({
      keywords: query.split(" "), // Basic keyword extraction
      actionItems,
      taskCard,
      workflowPlan,
      gaugeMetrics: res.locals.gaugeMetrics,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId,
      message: "Query parsed and workflow planned successfully.",
    });
  } catch (error) {
    console.error("Error in parse-query:", error);
    res.status(500).json({ error: "Failed to parse query. Please try again." });
  }
};
