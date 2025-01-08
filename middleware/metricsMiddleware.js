// middleware/metricsMiddleware.js

import { calculateMetrics } from "../src/util/metrics";

export const appendGaugeMetrics = async (req, res, next) => {
  try {
    // Example context; replace with dynamic data from your application
    const context = {
      tokenUsage: { used: 6000, total: 8192 }, // Placeholder values
      responseLatency: 0.8, // Example latency
      activeSubpersonas: req.activeSubpersonas || [],
    };

    const metrics = calculateMetrics(context);

    // Enrich metrics with additional information
    const enrichedMetrics = {
      ...metrics,
      totalSubpersonas: context.activeSubpersonas.length,
      suggestions: metrics.tokenUsage.used / metrics.tokenUsage.total > 0.8
        ? ["Consider reducing token usage to optimize performance."]
        : [],
    };

    // Attach metrics to the response object
    res.locals.gaugeMetrics = enrichedMetrics || {}; // Use an empty object as fallback

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error appending gauge metrics:", error);
    next(); // Proceed without attaching metrics in case of an error
  }
};
