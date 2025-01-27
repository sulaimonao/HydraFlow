// api/recommendations.js
import { generateRecommendations } from "../src/util/recommendations.js";
import { sessionContext } from "../middleware/sessionContext.js";

export default async (req, res) => {
  sessionContext(req, res, async () => {
    try {
      const { query } = req.body;
      // ✅ Input Validation
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        console.warn("⚠️ Invalid query input.");
        return res.status(400).json({ error: "A valid query string is required." });
      }

      const { userId, chatroomId } = req.session;

      // 🚀 Generate Recommendations
      let recommendations;
      try {
        const gaugeMetrics = req.session.gaugeMetrics || { tokenUsage: 0, performanceScore: 0 };
        recommendations = generateRecommendations(gaugeMetrics);
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
          recommendations = ["No specific recommendations available."];
        }
      } catch (recError) {
        console.error("❌ Error generating recommendations:", recError);
        return res.status(500).json({
          error: "Failed to generate recommendations.",
          details: recError.message,
        });
      }

      // 📦 Respond with Recommendations
      res.status(200).json({
        recommendations,
        user_id: userId,
        chatroom_id: chatroomId,
        message: "Recommendations generated successfully."
      });

    } catch (error) {
      console.error("❌ Error in recommendations.js:", error);
      res.status(500).json({ error: "Failed to process request." });
    }
  });
};
