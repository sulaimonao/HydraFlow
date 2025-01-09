// middleware/metricsMiddleware.js

import { calculateMetrics } from "../src/util/metrics";
import { generateRecommendations } from "../src/util/recommendations";
import supabase, { supabaseRequest } from '../lib/supabaseClient';

export const appendGaugeMetrics = async (req, res, next) => {
  try {
    const context = {
      tokenUsage: { used: 6000, total: 8192 }, // Replace with dynamic values
      responseLatency: 0.8, // Replace with real latency
      activeSubpersonas: req.activeSubpersonas || [], // Use active heads
    };

    const metrics = calculateMetrics(context);

    // Attach metrics to response object
    res.locals.gaugeMetrics = {
      ...metrics,
      totalSubpersonas: context.activeSubpersonas.length,
      recommendations: generateRecommendations(metrics), // Add recommendations
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error appending gauge metrics:", error);
    res.locals.gaugeMetrics = {}; // Default to empty object on error
    next();
  }
};
