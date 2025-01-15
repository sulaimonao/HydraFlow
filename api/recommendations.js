// api/recommendations.js
import { generateRecommendations } from "../src/util/recommendations.js";
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

export default async (req, res) => {
  try {
    const { query } = req.body;

    // ✅ Input Validation
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      console.warn("⚠️ Invalid query input.");
      return res.status(400).json({ error: "A valid query string is required." });
    }

    // 🚀 Retrieve persistent IDs from workflow manager
    let workflowContext;
    try {
      workflowContext = await orchestrateContextWorkflow({ query, req });
    } catch (workflowError) {
      console.error("❌ Workflow orchestration failed:", workflowError);
      return res.status(500).json({ error: "Workflow orchestration failed." });
    }

    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🔒 Validate session IDs
    if (!persistentUserId || !persistentChatroomId) {
      console.warn("⚠️ Invalid user_id or chatroom_id detected.");
      return res.status(400).json({ error: "Invalid user_id or chatroom_id." });
    }

    // 📊 Access or initialize gauge metrics
    const gaugeMetrics = res.locals?.gaugeMetrics || { tokenUsage: 0, performanceScore: 0 };

    // 💡 Generate recommendations safely
    let recommendations = [];
    try {
      recommendations = generateRecommendations(gaugeMetrics);
    } catch (recError) {
      console.error("❌ Error generating recommendations:", recError);
      recommendations = ["Failed to generate specific recommendations."];
    }

    // ✅ Ensure recommendations are not empty
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      recommendations = ["No specific recommendations available."];
    }

    // 📦 Respond with recommendations and metrics
    res.status(200).json({
      recommendations,
      gaugeMetrics,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId,
      message: "Recommendations generated successfully."
    });

  } catch (error) {
    console.error("❌ Error in /api/recommendations:", error);

    res.status(500).json({
      error: "Failed to generate recommendations. Please try again.",
      details: error.message
    });
  }
};
