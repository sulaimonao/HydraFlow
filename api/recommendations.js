// api/recommendations.js
import { generateRecommendations } from "../src/util/recommendations.js";
import { orchestrateContextWorkflow } from "../src/logic/workflow_manager.js";

export default async (req, res) => {
  try {
    const { query } = req.body;
    // ✅ Input Validation
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      console.warn("⚠️ Invalid query input.");
      return res.status(400).json({ error: "A valid query string is required." });
    }
    // 🚀 Retrieve persistent IDs from workflow manager
    try {
      const workflowContext = await orchestrateContextWorkflow(req, {
        query: req.body.query || '',
        memory: req.body.memory || '',
        feedback: req.body.feedback || null,
        tokenCount: req.body.tokenCount || 0,
      });
      req.locals = { ...req.locals, ...workflowContext };
    } catch (workflowError) {
      console.error("❌ Workflow orchestration failed:", workflowError);
      return res.status(500).json({ error: "Workflow orchestration failed." });
    }
    const { userId, chatroomId, gaugeMetrics } = req.locals;
    // Validate that we have the required parameters from the workflow
    if (!userId || !chatroomId || !gaugeMetrics) {
      return res.status(500).json({ error: "Missing required parameters from workflow." });
    }    
    try {
      const recommendations = generateRecommendations(gaugeMetrics);
      // ✅ Ensure recommendations are not empty
      const recommendationsOutput = Array.isArray(recommendations) && recommendations.length > 0 ? recommendations : ["No specific recommendations available."];
      // 📦 Respond with recommendations and metrics
      res.status(200).json({
        recommendations: recommendationsOutput,
        gaugeMetrics,
        user_id: userId,
        chatroom_id: chatroomId,
        message: "Recommendations generated successfully."
      });
    } catch (recError) {
      console.error("❌ Error generating recommendations:", recError);
      res.status(500).json({
        error: "Failed to generate recommendations.",
        details: recError.message
      });
    }
  } catch (error) {
    console.error("❌ Error in /api/recommendations:", error);
    res.status(500).json({
      error: "Failed to generate recommendations. Please try again.",
      details: error.message
    });
  }
};

//Example of how to use the gaugeMetrics object
// const gaugeMetrics = {
//   tokenUsage: 10,
//   performanceScore: 0.8
// };
// generateRecommendations(gaugeMetrics);
//This function should take the gaugeMetrics object as a parameter and use it to generate recommendations.  For example, it might use the tokenUsage to determine how many recommendations to return, or the performanceScore to filter the recommendations.
