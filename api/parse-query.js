// api/parse-query.js
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { fetchTaskCards } from '../lib/db.js';

export default async (req, res) => {
  try {
    const { query } = req.body;

    // ✅ Input Validation
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      console.warn("⚠️ Invalid query input.");
      return res.status(400).json({ error: "A valid query string is required." });
    }

    // 📦 Fetch existing task cards with error handling
    let existingTaskCards = [];
    try {
      existingTaskCards = await fetchTaskCards();
    } catch (fetchError) {
      console.error("❌ Failed to fetch task cards:", fetchError);
      return res.status(500).json({ error: "Error fetching existing task cards." });
    }

    // 📝 Initialize tasks and details
    const actionItems = [];
    const extractedDetails = {};

    // 🔍 Predictive parsing and task identification
    if (/summarize.*logs/i.test(query)) {
      actionItems.push("summarize-logs");
      extractedDetails["summarize-logs"] = "Summarize the provided logs for key patterns and errors.";
    }

    if (/create.*persona/i.test(query)) {
      actionItems.push("create-subpersona");
      const personaDescriptionMatch = query.match(/create.*persona.*(?:like|inspired by)?\s(.*)/i);
      extractedDetails["create-subpersona"] = personaDescriptionMatch?.[1] || "Generic persona for dynamic user interaction.";
    }

    if (/optimize.*memory/i.test(query)) {
      actionItems.push("compress-memory");
      extractedDetails["compress-memory"] = "Compress and optimize memory for efficient usage.";
    }

    // 📝 Construct a structured task card
    const taskCard = {
      goal: query,
      priority: "High",
      subtasks: actionItems.map((item) => ({
        task: item,
        status: "pending",
        description: extractedDetails[item] || "No additional details provided.",
      })),
    };

    // 🚀 Predictive analysis and workflow orchestration
    let workflowPlan;
    try {
      workflowPlan = await orchestrateContextWorkflow({
        query,
        req,
        existingTasks: existingTaskCards,
        proposedTasks: taskCard.subtasks,
      });
    } catch (workflowError) {
      console.error("❌ Workflow orchestration failed:", workflowError);
      return res.status(500).json({ error: "Workflow orchestration failed." });
    }

    const persistentUserId = workflowPlan.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowPlan.generatedIdentifiers.chatroom_id;

    // 🔒 Validate session context IDs
    if (!persistentUserId || !persistentChatroomId) {
      console.warn("⚠️ Invalid user_id or chatroom_id detected.");
      return res.status(400).json({ error: "Invalid user_id or chatroom_id." });
    }

    // 🔍 Enhanced keyword extraction (removes special characters)
    const keywords = query.match(/\b\w+\b/g) || [];

    // ✅ Respond with structured data
    res.status(200).json({
      keywords,
      actionItems,
      taskCard,
      workflowPlan,
      gaugeMetrics: res.locals?.gaugeMetrics || {},
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId,
      message: "Query parsed and workflow planned successfully.",
    });

  } catch (error) {
    console.error("❌ Error in parse-query:", error);
    res.status(500).json({ error: "Failed to parse query. Please try again." });
  }
};
