// api/recommendations.js

import { generateRecommendations } from "../src/util/recommendations.js";
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

export default async (req, res) => {
  try {
    const { query } = req.body;

    // 🛠️ Ensure workflow manager provides persistent IDs
    const workflowContext = await orchestrateContextWorkflow({ query, req });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 📊 Access gauge metrics from the response (ensure middleware populates it)
    const gaugeMetrics = res.locals.gaugeMetrics || {};

    // ⚠️ Log a warning if gauge metrics are missing
    if (!res.locals.gaugeMetrics) {
      console.warn("Warning: gaugeMetrics is missing. Using default values.");
    }

    // 💡 Generate recommendations based on the gauge metrics
    const recommendations = generateRecommendations(gaugeMetrics);

    // 📦 Respond with recommendations and gauge metrics
    res.status(200).json({
      recommendations: recommendations.length > 0 ? recommendations : ["No specific recommendations available."],
      gaugeMetrics,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId,
      message: "Recommendations generated successfully."
    });
  } catch (error) {
    console.error("Error in /api/recommendations:", error);

    // ❌ Respond with an error status
    res.status(500).json({
      error: "Failed to generate recommendations. Please try again."
    });
  }
};
