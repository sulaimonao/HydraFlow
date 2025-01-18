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
      workflowContext = await orchestrateContextWorkflow(req, {
        query: req.body.query || '',
        memory: req.body.memory || '',
        feedback: req.body.feedback || null,
        tokenCount: req.body.tokenCount || 0,
      });

    } catch (workflowError) {
      console.error("❌ Workflow orchestration failed:", workflowError);
      return res.status(500).json({ error: "Workflow orchestration failed." });
    }

    const userId = req.session.userId;
    const chatroomId = req.session.chatroomId;

    // 🔒 Validate session IDs
    if (!userId || !chatroomId) {
      console.warn("⚠️ Invalid user_id or chatroom_id detected.");
      return res.status(401).json({ error: "Unauthorized: Missing user_id or chatroom_id in session." });
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
      user_id: userId,
      chatroom_id: chatroomId,
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
