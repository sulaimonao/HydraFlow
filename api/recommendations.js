//api/recommendations.js
import { generateRecommendations } from "../src/util/recommendations.js";

export default async (req, res) => {
  try {
    // Access gauge metrics from the response (ensure middleware populates it)
    const gaugeMetrics = res.locals.gaugeMetrics || {}; // Fallback to empty object if undefined

    // Log a warning if gauge metrics are missing
    if (!res.locals.gaugeMetrics) {
      console.warn("Warning: gaugeMetrics is missing. Using default values.");
    }

    // Generate recommendations based on the gauge metrics
    const recommendations = generateRecommendations(gaugeMetrics);

    // Respond with recommendations and gauge metrics
    res.status(200).json({
      recommendations: recommendations.length > 0 ? recommendations : ["No specific recommendations available."],
      gaugeMetrics,
      message: "Recommendations generated successfully.",
    });
  } catch (error) {
    console.error("Error in /api/recommendations:", error);

    // Respond with an error status
    res.status(500).json({
      error: "Failed to generate recommendations. Please try again.",
    });
  }
};
